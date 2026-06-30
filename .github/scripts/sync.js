const { Client } = require("@notionhq/client");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Khởi tạo kết nối tới Notion Client từ biến môi trường
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;
const repo = process.env.GITHUB_REPO;

// Hàm lấy danh sách các file thay đổi trong commit vừa rồi bằng Git lệnh
function getChangedFiles() {
  try {
    const output = execSync("git diff --name-status HEAD~1 HEAD").toString().trim();
    if (!output) return [];

    return output.split("\n").map((line) => {
      const [status, filePath] = line.split(/\s+/);
      return { status, path: filePath };
    });
  } catch (error) {
    console.log("Không thể so sánh commit (có thể là commit đầu tiên). Tiến hành quét toàn bộ file hiện tại...");
    const output = execSync("git ls-files").toString().trim();
    return output.split("\n").map((filePath) => ({ status: "A", path: filePath }));
  }
}

// Tìm kiếm xem file đã tồn tại trên Database Notion chưa dựa vào thuộc tính 'Path'
async function findNotionPageByPath(filePath) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Path",
      rich_text: {
        equals: filePath,
      },
    },
  });
  return response.results[0];
}

// Đọc nội dung file và tạo các khối dữ liệu (blocks) phù hợp với Notion API
function getFileContentBlocks(filePath) {
  // Bỏ qua nếu là thư mục hoặc file đặc biệt không đọc được văn bản hoặc quá lớn
  if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf8");
  // Notion giới hạn 1 khối text tối đa 2000 ký tự. Nếu file dài, ta cắt nhỏ ra.
  const chunks = content.match(/[\s\S]{1,1800}/g) || [content];
  
  // Lấy đuôi file để hiển thị định dạng ngôn ngữ code tương ứng trên Notion (js, py, html...)
  let ext = path.extname(filePath).substring(1) || "plain text";
  if (ext === "yml") ext = "yaml";

  return chunks.map(chunk => ({
    object: "block",
    type: "code",
    code: {
      rich_text: [{ type: "text", text: { content: chunk } }],
      language: ext
    }
  }));
}

async function main() {
  const changedFiles = getChangedFiles();
  console.log(`Tìm thấy ${changedFiles.length} thay đổi cần xử lý.`);

  for (const file of changedFiles) {
    const fileName = path.basename(file.path);
    const fileUrl = `https://github.com/${repo}/blob/main/${file.path}`;

    // Loại bỏ các file cấu hình hệ thống hoặc file nằm trong thư mục node_modules
    if (file.path.startsWith(".github/") || file.path.includes("node_modules/")) {
      continue;
    }

    try {
      const existingPage = await findNotionPageByPath(file.path);

      if (file.status === "D") {
        // Nếu file bị XÓA trên GitHub -> Xóa hoặc Đánh dấu trên Notion
        if (existingPage) {
          await notion.pages.update({
            page_id: existingPage.id,
            archived: true // Đưa trang vào thùng rác Notion
          });
          console.log(`Đã xóa file khỏi Notion: ${file.path}`);
        }
      } else {
        // Nếu file được THÊM MỚI hoặc CHỈNH SỬA
        const blocks = getFileContentBlocks(file.path);
        const properties = {
          Name: { title: [{ text: { content: fileName } }] },
          Path: { rich_text: [{ text: { content: file.path } }] },
          URL: { url: fileUrl },
          "Last Updated": { date: { start: new Date().toISOString() } }
        };

        if (existingPage) {
          // 1. Tiến hành CẬP NHẬT thông tin trang
          await notion.pages.update({ page_id: existingPage.id, properties });

          // 2. Xóa các nội dung cũ bên trong trang để ghi đè nội dung mới
          const oldBlocks = await notion.blocks.children.list({ block_id: existingPage.id });
          for (const oldBlock of oldBlocks.results) {
            await notion.blocks.delete({ block_id: oldBlock.id });
          }

          // 3. Ghi nội dung code mới vào trang
          if (blocks.length > 0) {
            await notion.blocks.children.append({ block_id: existingPage.id, children: blocks });
          }
          console.log(`Đã cập nhật nội dung file: ${file.path}`);
        } else {
          // Tạo trang MỚI HOÀN TOÀN
          await notion.pages.create({
            parent: { database_id: databaseId },
            properties,
            children: blocks.length > 0 ? blocks : undefined
          });
          console.log(`Đã đồng bộ file mới: ${file.path}`);
        }
      }
    } catch (apiError) {
      console.error(`Lỗi khi xử lý file ${file.path}:`, apiError.message);
    }
  }
}

main();