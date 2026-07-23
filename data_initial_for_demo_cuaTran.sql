-- =====================================================================================
-- SEAL Hackathon Summer 2026 - HARDCODE SEED SCRIPT (PostgreSQL)
-- UPDATE CẤU TRÚC PHÂN CÔNG GIÁM KHẢO CHẤM ĐA TRACK THEO YÊU CẦU MỚI NHẤT
-- =====================================================================================

BEGIN;

-- =========================================================================
-- Bổ sung 3 cột current_round / stopped_round / score cho bảng team
-- (idempotent: chỉ thêm nếu schema chưa có; nếu đã có thì bỏ qua)
-- =========================================================================
ALTER TABLE public.team ADD COLUMN IF NOT EXISTS current_round varchar(255);
ALTER TABLE public.team ADD COLUMN IF NOT EXISTS stopped_round varchar(255);
ALTER TABLE public.team ADD COLUMN IF NOT EXISTS score double precision DEFAULT 0;

DO $$
DECLARE
    v_coordinator_id   BIGINT;
    v_event_id         BIGINT;

    v_track_ai_id       BIGINT;
    v_track_iot_id       BIGINT;
    v_track_blockchain_id BIGINT;

    v_round1_id        BIGINT; -- Sơ loại
    v_round2_id        BIGINT; -- Chung kết

    -- ScoringTemplate + Criterion
    v_scoring_template_id BIGINT;
    v_crit_ids         BIGINT[]; 

    -- Các JudgeAssignment IDs để phục vụ loop chấm điểm
    v_ja_r1_tuan_ai_id     BIGINT;
    v_ja_r1_tuan_iot_id    BIGINT;
    v_ja_r1_tuan_bc_id     BIGINT;
    v_ja_r2_tuan_ai_id     BIGINT;
    v_ja_r2_tuan_iot_id    BIGINT;
    v_ja_r2_tuan_bc_id     BIGINT;
    v_ja_r2_long_ai_id     BIGINT;
    v_ja_r2_long_iot_id    BIGINT;
    v_ja_r2_long_bc_id     BIGINT;
    v_ja_r2_kanh_ai_id     BIGINT;
    v_ja_r2_kanh_iot_id    BIGINT;
    v_ja_r2_kanh_bc_id     BIGINT;

    v_mentor_khang_id  BIGINT;
    v_mentor_ngoc_id   BIGINT;
    v_mentor_phuc_id   BIGINT;
    v_mentor_ha_id     BIGINT; -- Đỗ Thu Hà
    v_judge_tuan_id    BIGINT;
    v_judge_long_id    BIGINT;
    v_judge_kimanh_id  BIGINT;

    -- Pools dữ liệu giả lập account
    first_names TEXT[] := ARRAY['Nguyễn Văn','Trần Thị','Lê Hoàng','Phạm Minh','Hoàng Thị','Vũ Đức','Đặng Ngọc','Bùi Quốc','Đỗ Thanh','Ngô Gia'];
    last_names  TEXT[] := ARRAY['An','Bình','Chi','Dũng','Hà','Khang','Linh','Minh','Nam','Oanh','Phúc','Quân'];
    schools     TEXT[] := ARRAY['Trường đại học FPT','Trường đại học Hoa Sen','Trường đại học Bách Khoa TP.HCM','Trường đại học Công Nghệ Thông Tin'];

    v_full_name   TEXT;
    v_email       TEXT;
    v_user_id     BIGINT;
    v_team_id     BIGINT;
    v_leader_id   BIGINT;
    v_track_id    BIGINT;

    -- 21 team: 7 AI + 8 IoT + 6 Blockchain
    v_team_sizes  INT[] := ARRAY[5,4,4,5,4,4,4,   5,4,4,5,4,4,4,4,   5,4,4,5,4,4];
    v_team_tracks BIGINT[];
    v_team_ids    BIGINT[] := ARRAY[]::BIGINT[];

    -- Config: Top N đội vượt qua Vòng 1 vào Chung kết (Đánh số thứ tự đội từ 1-21)
    v_top_pass_r1 INT := 6;
    v_finalist_positions INT[] := ARRAY[1,4,9,12,17,19]; -- Top 6 (2 đội/track: AI 1,4 | IoT 9,12 | Blockchain 17,19)
    v_is_finalist BOOLEAN;

    v_submission_id  BIGINT;
    v_judge_score_id BIGINT;
    v_active_ja_id   BIGINT;
    s1 NUMERIC; s2 NUMERIC; s3 NUMERIC; s4 NUMERIC;
    v_total   NUMERIC;
    v_round2_score_sum NUMERIC;
    v_target  NUMERIC;

    v_cursor      INT := 1;
    i INT; j INT; k INT;
BEGIN
    -- =========================================================================
    -- BƯỚC 0: Tài khoản BTC / Coordinator
    -- =========================================================================
    INSERT INTO users (email, password, full_name, role, active, status, school_name, title, org)
    VALUES ('organizer.seal2026@gmail.com', '123456', 'Ban Tổ Chức SEAL Hackathon', 'ADMIN', true, 'ACCEPTED',
            'Trường đại học FPT', 'Event Coordinator', 'SEAL - Software Engineering Agile League')
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id INTO v_coordinator_id;

    -- =========================================================================
    -- BƯỚC 1: Event
    -- =========================================================================
    INSERT INTO event (name, create_at, description, description_detail, status, min_team_member, topic, open_register_time, close_register_time, cofirm_team_time, max_team_member, rules, event_location, participation_benefits, keywords, max_team, thumbnail_image, banner_img)
    VALUES ('SEAL Hackathon Summer 2026', NOW(), 'Sân chơi công nghệ dành cho sinh viên CNTT khu vực TP.HCM, nơi những ý tưởng AI, IoT và Blockchain được hiện thực hóa thành sản phẩm thực tế chỉ trong một ngày thi đấu.', 'SEAL Hackathon Summer 2026 là sự kiện thứ ba trong hệ thống SEAL – Software Engineering Agile League, tiếp nối thành công của SEAL Fall 2025 và SEAL Spring 2026. Đây là sân chơi học thuật dành cho sinh viên ngành Công nghệ thông tin đang theo học tại Trường Đại học FPT cơ sở TP.HCM và các trường đại học khác trên địa bàn thành phố. Đúng với định hướng "Summer SEAL – Emerging Technologies", mùa giải năm nay tập trung vào ba công nghệ mới nổi: Trí tuệ nhân tạo (AI), Internet vạn vật (IoT) và Blockchain. Thí sinh sẽ được thử thách xây dựng sản phẩm ứng dụng một hoặc kết hợp các công nghệ này để giải quyết bài toán thực tế, đồng thời rèn luyện kỹ năng làm việc nhóm, tư duy sản phẩm và khả năng thuyết trình chuyên nghiệp.', 'LIVE', 3, 'Emerging Frontiers: AI, IoT & Blockchain Innovation', '2026-07-12 00:00:00', '2026-07-31 23:59:59', '2026-08-05 23:59:59', 5, 'Mỗi đội thi từ 3–5 thành viên, thực hiện code và xây dựng sản phẩm trong thời gian quy định của từng vòng thi. Đội thi phải lưu trữ mã nguồn và kết quả trên các nền tảng cloud chuyên dụng: GitHub, Jira, Confluence, Notion hoặc tương đương (không chấp nhận Google Drive hoặc dịch vụ cá nhân). Sản phẩm dự thi được trình bày dưới dạng slide kèm demo trực tiếp hoặc video. Các đội chỉ được sử dụng AI Agent framework do Ban tổ chức cho phép: LangGraph, OpenAI SDK, Google Gemini SDK, LlamaIndex; hoặc mở rộng sang CrewAI, AutoGen, HuggingFace Agents nếu thể hiện được tính sáng tạo phù hợp với track đã chọn.', 'Hội trường FPT University, cơ sở TP.HCM', 'Nhận Giấy chứng nhận tham gia SEAL Hackathon Summer 2026; được Mentor hỗ trợ kỹ thuật trực tiếp và tham gia miễn phí Workshop "Emerging Tech 101"; có cơ hội networking với giám khảo, cố vấn, doanh nghiệp đối tác và nhận hỗ trợ hậu cần trong các buổi thi đấu offline.', ARRAY['AI','IoT','Blockchain'], 22, 'https://drive.google.com/uc?id=1KNHWMa9QcXJZBSo6P7MEzYYZaVyyhazZ', 'https://drive.google.com/uc?id=1a9g02-WBhc_0OJFOOFXWZ52T909seGLx')
    RETURNING id INTO v_event_id;

    -- =========================================================================
    -- BƯỚC 2 & BƯỚC 3: EventNotes & Prizes
    -- =========================================================================
    INSERT INTO event_notes (title, description, event_id) VALUES
        ('Quy định chung', 'Thí sinh tuân thủ nội quy chung của SEAL Hackathon Summer 2026.', v_event_id),
        ('Quy định về tư cách tham gia', 'Sinh viên ngành CNTT đang theo học tại FPT University cơ sở TP.HCM hoặc các trường đại học khác trên địa bàn TP.HCM. Sinh viên đã tốt nghiệp không được tham gia. Một thí sinh chỉ được tham gia một đội thi.', v_event_id),
        ('Quy định về đội thi', 'Mỗi đội từ 3–5 thành viên. Sau thời gian kết thúc đăng ký, các đội thi không được thay đổi thành viên.', v_event_id),
        ('Quy định về sản phẩm dự thi', 'Sản phẩm nộp dự thi phải là kết quả làm việc của chính đội thi trong thời gian cuộc thi diễn ra, không sao chép hoặc đạo nhái từ nguồn khác.', v_event_id);

    -- Milestone: Workshop Online "Emerging Tech 101" (nguồn: trang Thông tin chuẩn bị sẵn - Bước 6)
    INSERT INTO milestone (milestone_name, des, date_start, date_end, link, event_id) VALUES
        ('Workshop "Emerging Tech 101: Nhập môn AI, IoT & Blockchain"', 'Buổi workshop training online trang bị kiến thức nền tảng về AI, IoT & Blockchain cho thí sinh trước khi thi đấu.', '2026-08-08 00:00:00', '2026-08-08 00:00:00', 'Link Google Meet (cập nhật sau)', v_event_id),
        ('Khai mạc & bốc thăm chọn track', 'Thí sinh tham gia lễ khai mạc, bốc thăm chọn track và kiểm tra chỗ ngồi, kết nối internet trước ngày thi.', '2026-08-15 00:00:00', '2026-08-15 00:00:00', NULL, v_event_id);
    INSERT INTO prize (description, money, prize_type, prize_name, quantity, event_id) VALUES 
        ('Giải Nhất', 10000000, 'MAIN', 'Giải Nhất', 1, v_event_id),
        ('Giải Nhì', 7000000, 'MAIN', 'Giải Nhì', 1, v_event_id),
        ('Giải Ba', 5000000, 'MAIN', 'Giải Ba', 1, v_event_id),
        ('Dành cho đội có ý tưởng ứng dụng AI/IoT/Blockchain độc đáo và khả thi nhất; kèm giấy chứng nhận', 3000000, 'EXTENDED', 'Giải Sáng tạo (Best Innovation)', 1, v_event_id),
        ('Dành cho đội sinh viên năm nhất/năm hai có sản phẩm tiềm năng nhất; kèm giấy chứng nhận', 2000000, 'EXTENDED', 'Giải Triển vọng (Rising Star)', 1, v_event_id);

    -- =========================================================================
    -- BƯỚC 4: Rubric & Criterions
    -- =========================================================================
    INSERT INTO scoring_template (name, description, url, create_at, update_at, usage_count, status, is_tie_breaking, standard_deviation)
    VALUES ('Bộ tiêu chí chấm điểm SEAL Hackathon Summer 2026 – Emerging Tech', 'Bộ tiêu chí đánh giá sản phẩm dự thi trên thang điểm 10 cho mỗi tiêu chí và tổng hợp theo trọng số (tổng 100%). Áp dụng thống nhất cho cả Vòng Sơ loại và Vòng Chung kết.', NULL, NOW(), NOW(), 2, 'PUBLISHED', false, 0) RETURNING id INTO v_scoring_template_id;

    INSERT INTO criterion (name, description, weight, max_range, scoring_template_id) VALUES
        ('Ý tưởng & Tính sáng tạo', 'Mức độ mới mẻ, độc đáo và khả thi của ý tưởng; khả năng vận dụng AI, IoT hoặc Blockchain để giải quyết một vấn đề thực tế. Thang điểm 10, trọng số 25%.', 25, 10, v_scoring_template_id),
        ('Chất lượng kỹ thuật & Mức độ hoàn thiện', 'Kiến trúc giải pháp, chất lượng mã nguồn, mức độ hoàn thiện của sản phẩm và độ ổn định khi vận hành/demo. Thang điểm 10, trọng số 30%.', 30, 10, v_scoring_template_id),
        ('Giá trị ứng dụng & Tác động', 'Mức độ giải quyết đúng bài toán, tính hữu ích thực tế, tiềm năng mở rộng và tác động tới người dùng/cộng đồng. Thang điểm 10, trọng số 25%.', 25, 10, v_scoring_template_id),
        ('Thuyết trình & Demo', 'Khả năng trình bày mạch lạc, thuyết phục; chất lượng phần demo trực tiếp và phần trả lời câu hỏi của giám khảo. Thang điểm 10, trọng số 20%.', 20, 10, v_scoring_template_id);

    SELECT ARRAY(SELECT id FROM criterion WHERE scoring_template_id = v_scoring_template_id ORDER BY id) INTO v_crit_ids;

    -- =========================================================================
    -- BƯỚC 5: Tracks
    -- =========================================================================
    INSERT INTO track (name, is_published, des, min_team_per_track, max_team_per_track, event_id) VALUES ('Track AI & Machine Learning', 1, 'Track AI', 0, 8, v_event_id) RETURNING id INTO v_track_ai_id;
    INSERT INTO track (name, is_published, des, min_team_per_track, max_team_per_track, event_id) VALUES ('Track IoT & Smart Systems', 1, 'Track IoT', 0, 8, v_event_id) RETURNING id INTO v_track_iot_id;
    INSERT INTO track (name, is_published, des, min_team_per_track, max_team_per_track, event_id) VALUES ('Track Blockchain & Web3', 1, 'Track Blockchain', 0, 6, v_event_id) RETURNING id INTO v_track_blockchain_id;

    -- =========================================================================
    -- BƯỚC 6: Rounds & Submission Configs
    -- =========================================================================
    INSERT INTO round (name, is_published_result, time_start, time_end, has_presetiontation, top_team_pass, ordinal_number, submission_deadline, position, location_name, event_id, scoring_template_id)
    VALUES ('Vòng 1: Sơ loại', false, '2026-08-16 07:00:00', '2026-08-16 14:00:00', true, v_top_pass_r1, 1, '2026-08-16 13:00:00', 'OFFLINE', 'Hội trường FPT University', v_event_id, v_scoring_template_id) RETURNING id INTO v_round1_id;

    INSERT INTO round (name, is_published_result, time_start, time_end, has_presetiontation, top_team_pass, ordinal_number, submission_deadline, position, location_name, event_id, scoring_template_id)
    VALUES ('Vòng 2: Chung kết', false, '2026-08-23 08:00:00', '2026-08-23 17:00:00', true, 0, 2, '2026-08-22 23:59:00', 'OFFLINE', 'Hội trường A, FPT University', v_event_id, v_scoring_template_id) RETURNING id INTO v_round2_id;

    INSERT INTO submission_config (round_id, title, submission_instructions, opening_time, submission_deadline, has_submission) VALUES
        (v_round1_id, 'Nộp bài Vòng Sơ loại', 'Nộp link bài thi vòng 1...', '2026-08-12 08:00:00', '2026-08-16 13:00:00', true),
        (v_round2_id, 'Nộp bài Vòng Chung kết', 'Nộp link bài thi vòng 2...', '2026-08-17 08:00:00', '2026-08-22 23:59:00', true);


	-- =========================================================================
    -- BƯỚC THÊM 6.1: KHỞI TẠO MỐI QUAN HỆ GIỮA ROUND VÀ TRACK (BẢNG round_track)
    -- =========================================================================

    -- 1. Thiết lập cấu hình cho Vòng 1 (Sơ loại) với cả 3 Track
    INSERT INTO round_track (round_id, track_id, publish_stage)
    VALUES 
        (v_round1_id, v_track_ai_id, 2),          -- Vòng 1 - Track AI: Đã công bố kết quả (Stage 2)
        (v_round1_id, v_track_iot_id, 2),         -- Vòng 1 - Track IoT: Đã công bố kết quả (Stage 2)
        (v_round1_id, v_track_blockchain_id, 0)   -- Vòng 1 - Track Blockchain: Mặc định đóng (Stage 0)
    ON CONFLICT (round_id, track_id) DO NOTHING;

    -- 2. Thiết lập cấu hình cho Vòng 2 (Chung kết) với cả 3 Track
    INSERT INTO round_track (round_id, track_id, publish_stage)
    VALUES 
        (v_round2_id, v_track_ai_id, 0),          -- Vòng 2 - Track AI: Đang chấm, chưa công bố
        (v_round2_id, v_track_iot_id, 0),         -- Vòng 2 - Track IoT: Đang chấm, chưa công bố
        (v_round2_id, v_track_blockchain_id, 0)   -- Vòng 2 - Track Blockchain: Đang chấm, chưa công bố
    ON CONFLICT (round_id, track_id) DO NOTHING;



	-- BƯỚC BỔ SUNG　6.2: KHỞI TẠO LỊCH TRÌNH CHI TIẾT (round_timeline)
    -- Khớp cấu hình chuỗi String & logic thời gian tịnh tiến liên tục
    -- =========================================================================
    
    -- 1. Lịch trình chi tiết cho Vòng 1: Sơ loại (07:00 – 14:00 ngày 16/08/2026)
    INSERT INTO round_timeline (name, description, time_start, time_end, round_id)
    VALUES 
        ('Check-in & ổn định chỗ ngồi', 
         'Thí sinh check-in, kiểm tra internet và vị trí ngồi theo track.', 
         '07:00', '07:30', v_round1_id),
         
        ('Nhận đề bài & bắt đầu code', 
         'BTC công bố đề bài chi tiết theo từng track, các đội bắt đầu triển khai.', 
         '07:30', '13:00', v_round1_id),
         
        ('Đóng cổng nộp bài', 
         'Các đội hoàn tất nộp sản phẩm dự thi.', 
         '13:00', '13:15', v_round1_id),
         
        ('Thuyết trình & chấm điểm sơ loại', 
         'Mỗi đội thuyết trình trước giám khảo theo bảng thi đấu tương ứng.', 
         '13:15', '14:00', v_round1_id);

    -- 2. Lịch trình chi tiết cho Vòng 2: Chung kết (08:00 – 17:00 ngày 23/08/2026)
    INSERT INTO round_timeline (name, description, time_start, time_end, round_id)
    VALUES 
        ('Khai mạc vòng Chung kết', 
         'BTC giới thiệu các đội xuất sắc nhất vào chung kết.', 
         '08:00', '08:30', v_round2_id),
         
        ('Thuyết trình các đội chung kết', 
         'Mỗi đội trình bày sản phẩm và trả lời câu hỏi từ ban giám khảo.', 
         '08:30', '13:00', v_round2_id),
         
        ('Ban giám khảo thảo luận', 
         'Hội đồng giám khảo tổng hợp điểm và thống nhất kết quả.', 
         '13:00:00', '16:00', v_round2_id),
         
        ('Lễ bế mạc & trao giải', 
         'Công bố kết quả và trao giải cho các đội đạt giải.', 
         '16:00', '17:00', v_round2_id);



	
	
    -- =========================================================================
    -- BƯỚC 7: Tài khoản Mentor & Judge
    -- =========================================================================
    INSERT INTO users (email, password, full_name, role, active, status, title, org) VALUES 
        ('nguyenminhkhang.mentor@seal.dev', '123456', 'Nguyễn Minh Khang', 'LECTURER', true, 'ACCEPTED', 'Senior AI Engineer', 'FPT Software') RETURNING id INTO v_mentor_khang_id;
    INSERT INTO users (email, password, full_name, role, active, status, title, org) VALUES 
        ('tranthibichngoc.mentor@seal.dev', '123456', 'Trần Thị Bích Ngọc', 'LECTURER', true, 'ACCEPTED', 'IoT Solution Architect', 'Viettel Digital') RETURNING id INTO v_mentor_ngoc_id;
    INSERT INTO users (email, password, full_name, role, active, status, title, org) VALUES 
        ('lehoangphuc.mentor@seal.dev', '123456', 'Lê Hoàng Phúc', 'LECTURER', true, 'ACCEPTED', 'Blockchain Developer', 'VNG Corporation') RETURNING id INTO v_mentor_phuc_id;
    
    -- Tài khoản Đỗ Thu Hà
    INSERT INTO users (email, password, full_name, role, active, status, title, org) VALUES 
        ('dothuha.mentorjudge@seal.dev', '123456', 'Đỗ Thu Hà', 'LECTURER', true, 'ACCEPTED', 'Technical Lead', 'Công ty CP Giải pháp... ABC') RETURNING id INTO v_mentor_ha_id;

    INSERT INTO users (email, password, full_name, role, active, status, title, org) VALUES 
        ('phamanhtuan.judge@seal.dev', '123456', 'Phạm Anh Tuấn', 'LECTURER', true, 'ACCEPTED', 'Giảng viên CNTT', 'FPT University TP.HCM') RETURNING id INTO v_judge_tuan_id;
    INSERT INTO users (email, password, full_name, role, active, status, title, org) VALUES 
        ('vuduclong.judge@seal.dev', '123456', 'Vũ Đức Long', 'LECTURER', true, 'ACCEPTED', 'CTO', 'Startup công nghệ XYZ') RETURNING id INTO v_judge_long_id;
    INSERT INTO users (email, password, full_name, role, active, status, title, org) VALUES 
        ('ngothikimanh.judge@seal.dev', '123456', 'Ngô Thị Kim Anh', 'LECTURER', true, 'ACCEPTED', 'Giám đốc Sản phẩm', 'Công ty DEF Tech') RETURNING id INTO v_judge_kimanh_id;

    -- ---- Lời mời Hệ thống (System Request) phân rã theo từng Track ----
    -- 1. Mentor Requests
    INSERT INTO system_request (sender_id, receiver_id, reference_id, track_id, round_id, reference_type, type, status, message, sent_at, created_at, updated_at) VALUES
        (v_coordinator_id, v_mentor_khang_id, v_event_id, v_track_ai_id, 0, 'EVENT', 'MENTOR_INVITE', 'ACCEPTED', 'Mời làm Mentor AI', NOW(), NOW(), NOW()),
        (v_coordinator_id, v_mentor_ngoc_id, v_event_id, v_track_iot_id, 0, 'EVENT', 'MENTOR_INVITE', 'ACCEPTED', 'Mời làm Mentor IoT', NOW(), NOW(), NOW()),
        (v_coordinator_id, v_mentor_phuc_id, v_event_id, v_track_blockchain_id, 0, 'EVENT', 'MENTOR_INVITE', 'ACCEPTED', 'Mời làm Mentor Blockchain', NOW(), NOW(), NOW()),
        (v_coordinator_id, v_mentor_ha_id, v_event_id, v_track_iot_id, 0, 'EVENT', 'MENTOR_INVITE', 'PENDING', 'Mời làm Mentor IoT', NOW(), NOW(), NOW());

    -- 2. Judge Requests (Tách biệt rõ ràng từng Track của từng Vòng đấu)
    -- VÒNG SƠ LOẠI
    INSERT INTO system_request (sender_id, receiver_id, reference_id, track_id, round_id, reference_type, type, status, message, sent_at, created_at, updated_at) VALUES
        (v_coordinator_id, v_judge_tuan_id, v_event_id, v_track_ai_id, v_round1_id, 'EVENT', 'JUDGE_INVITE', 'ACCEPTED', 'Mời chấm Sơ loại - Track AI', NOW(), NOW(), NOW()),
        (v_coordinator_id, v_judge_tuan_id, v_event_id, v_track_iot_id, v_round1_id, 'EVENT', 'JUDGE_INVITE', 'ACCEPTED', 'Mời chấm Sơ loại - Track IoT', NOW(), NOW(), NOW()),
        (v_coordinator_id, v_judge_tuan_id, v_event_id, v_track_blockchain_id, v_round1_id, 'EVENT', 'JUDGE_INVITE', 'ACCEPTED', 'Mời chấm Sơ loại - Track Blockchain', NOW(), NOW(), NOW()),
        -- Đỗ Thu Hà chưa chấp nhận ở cả 2 track sơ loại -> PENDING
        (v_coordinator_id, v_mentor_ha_id, v_event_id, v_track_ai_id, v_round1_id, 'EVENT', 'JUDGE_INVITE', 'PENDING', 'Mời chấm Sơ loại - Track AI', NOW(), NOW(), NOW()),
        (v_coordinator_id, v_mentor_ha_id, v_event_id, v_track_ai_id, v_round2_id, 'EVENT', 'JUDGE_INVITE', 'PENDING', 'Mời chấm Chung kết - Track AI', NOW(), NOW(), NOW());

    -- VÒNG CHUNG KẾT (Cả 3 giám khảo chấm TẤT CẢ các Track -> Mỗi người có 3 requests riêng biệt)
    INSERT INTO system_request (sender_id, receiver_id, reference_id, track_id, round_id, reference_type, type, status, message, sent_at, created_at, updated_at) VALUES
        -- Phạm Anh Tuấn
        (v_coordinator_id, v_judge_tuan_id, v_event_id, v_track_ai_id, v_round2_id, 'EVENT', 'JUDGE_INVITE', 'ACCEPTED', 'Mời chấm Chung kết - Track AI', NOW(), NOW(), NOW()),
        (v_coordinator_id, v_judge_tuan_id, v_event_id, v_track_iot_id, v_round2_id, 'EVENT', 'JUDGE_INVITE', 'ACCEPTED', 'Mời chấm Chung kết - Track IoT', NOW(), NOW(), NOW()),
        (v_coordinator_id, v_judge_tuan_id, v_event_id, v_track_blockchain_id, v_round2_id, 'EVENT', 'JUDGE_INVITE', 'ACCEPTED', 'Mời chấm Chung kết - Track Blockchain', NOW(), NOW(), NOW()),
        -- Vũ Đức Long
        (v_coordinator_id, v_judge_long_id, v_event_id, v_track_ai_id, v_round2_id, 'EVENT', 'JUDGE_INVITE', 'ACCEPTED', 'Mời chấm Chung kết - Track AI', NOW(), NOW(), NOW()),
        (v_coordinator_id, v_judge_long_id, v_event_id, v_track_iot_id, v_round2_id, 'EVENT', 'JUDGE_INVITE', 'ACCEPTED', 'Mời chấm Chung kết - Track IoT', NOW(), NOW(), NOW()),
        (v_coordinator_id, v_judge_long_id, v_event_id, v_track_blockchain_id, v_round2_id, 'EVENT', 'JUDGE_INVITE', 'ACCEPTED', 'Mời chấm Chung kết - Track Blockchain', NOW(), NOW(), NOW()),
        -- Ngô Thị Kim Anh
        (v_coordinator_id, v_judge_kimanh_id, v_event_id, v_track_ai_id, v_round2_id, 'EVENT', 'JUDGE_INVITE', 'ACCEPTED', 'Mời chấm Chung kết - Track AI', NOW(), NOW(), NOW()),
        (v_coordinator_id, v_judge_kimanh_id, v_event_id, v_track_iot_id, v_round2_id, 'EVENT', 'JUDGE_INVITE', 'ACCEPTED', 'Mời chấm Chung kết - Track IoT', NOW(), NOW(), NOW()),
        (v_coordinator_id, v_judge_kimanh_id, v_event_id, v_track_blockchain_id, v_round2_id, 'EVENT', 'JUDGE_INVITE', 'ACCEPTED', 'Mời chấm Chung kết - Track Blockchain', NOW(), NOW(), NOW());

    -- ---- Ánh xạ Phân công (Assignments) cho những người đã ACCEPTED ----
    INSERT INTO mentor_assignment (track_id, mentor_id, event_id) VALUES
        (v_track_ai_id, v_mentor_khang_id, v_event_id),
        (v_track_iot_id, v_mentor_ngoc_id, v_event_id),
        (v_track_blockchain_id, v_mentor_phuc_id, v_event_id);

    -- Phân công Giám khảo cụ thể từng Track (Hà chưa accept n��n không map)
    INSERT INTO judege_assignment (track_id, round_id, judge_id, event_id) VALUES
        -- Vòng 1
        (v_track_ai_id, v_round1_id, v_judge_tuan_id, v_event_id),
        (v_track_iot_id, v_round1_id, v_judge_tuan_id, v_event_id),
        (v_track_blockchain_id, v_round1_id, v_judge_tuan_id, v_event_id),
        -- Vòng 2 (Cả 3 thầy cô map đủ 3 tracks)
        (v_track_ai_id, v_round2_id, v_judge_tuan_id, v_event_id),
        (v_track_iot_id, v_round2_id, v_judge_tuan_id, v_event_id),
        (v_track_blockchain_id, v_round2_id, v_judge_tuan_id, v_event_id),
        
        (v_track_ai_id, v_round2_id, v_judge_long_id, v_event_id),
        (v_track_iot_id, v_round2_id, v_judge_long_id, v_event_id),
        (v_track_blockchain_id, v_round2_id, v_judge_long_id, v_event_id),
        
        (v_track_ai_id, v_round2_id, v_judge_kimanh_id, v_event_id),
        (v_track_iot_id, v_round2_id, v_judge_kimanh_id, v_event_id),
        (v_track_blockchain_id, v_round2_id, v_judge_kimanh_id, v_event_id);

    -- Lấy ID phân công để dùng cho vòng lặp gán điểm số chính xác
    SELECT id INTO v_ja_r1_tuan_ai_id  FROM judege_assignment WHERE round_id = v_round1_id AND judge_id = v_judge_tuan_id AND track_id = v_track_ai_id;
    SELECT id INTO v_ja_r1_tuan_iot_id FROM judege_assignment WHERE round_id = v_round1_id AND judge_id = v_judge_tuan_id AND track_id = v_track_iot_id;
    SELECT id INTO v_ja_r1_tuan_bc_id  FROM judege_assignment WHERE round_id = v_round1_id AND judge_id = v_judge_tuan_id AND track_id = v_track_blockchain_id;
    
    SELECT id INTO v_ja_r2_tuan_ai_id  FROM judege_assignment WHERE round_id = v_round2_id AND judge_id = v_judge_tuan_id AND track_id = v_track_ai_id;
    SELECT id INTO v_ja_r2_tuan_iot_id FROM judege_assignment WHERE round_id = v_round2_id AND judge_id = v_judge_tuan_id AND track_id = v_track_iot_id;
    SELECT id INTO v_ja_r2_tuan_bc_id  FROM judege_assignment WHERE round_id = v_round2_id AND judge_id = v_judge_tuan_id AND track_id = v_track_blockchain_id;

    SELECT id INTO v_ja_r2_long_ai_id  FROM judege_assignment WHERE round_id = v_round2_id AND judge_id = v_judge_long_id AND track_id = v_track_ai_id;
    SELECT id INTO v_ja_r2_long_iot_id FROM judege_assignment WHERE round_id = v_round2_id AND judge_id = v_judge_long_id AND track_id = v_track_iot_id;
    SELECT id INTO v_ja_r2_long_bc_id  FROM judege_assignment WHERE round_id = v_round2_id AND judge_id = v_judge_long_id AND track_id = v_track_blockchain_id;

    SELECT id INTO v_ja_r2_kanh_ai_id  FROM judege_assignment WHERE round_id = v_round2_id AND judge_id = v_judge_kimanh_id AND track_id = v_track_ai_id;
    SELECT id INTO v_ja_r2_kanh_iot_id FROM judege_assignment WHERE round_id = v_round2_id AND judge_id = v_judge_kimanh_id AND track_id = v_track_iot_id;
    SELECT id INTO v_ja_r2_kanh_bc_id  FROM judege_assignment WHERE round_id = v_round2_id AND judge_id = v_judge_kimanh_id AND track_id = v_track_blockchain_id;

    -- =========================================================================
    -- BƯỚC 8: Tài khoản 10 user rảnh và Khởi tạo 21 Teams
    -- =========================================================================

	-- ---- 4 account FPT (có profile) ----
    INSERT INTO users (email, password, full_name, role, active, status, school_name)
    VALUES
        ('khanh.demo@gmail.com', '123456', 'Bùi Thiên Khánh',      'USER', true, 'ACCEPTED', 'Trường đại học FPT'),
        ('tung.demo@gmail.com',  '123456', 'Mạc Minh Tùng',        'USER', true, 'ACCEPTED', 'Trường đại học FPT'),
        ('khoa.demo@gmail.com',  '123456', 'Phạm Khắc Đăng Khoa',  'USER', true, 'ACCEPTED', 'Trường đại học FPT'),
        ('tran.demo@gmail.com',  '123456', 'Hồ Ngọc Bảo Trân',     'USER', true, 'ACCEPTED', 'Trường đại học FPT')
    ON CONFLICT (email) DO NOTHING;

    -- Student_profile cho 4 account trên
    INSERT INTO student_profile (user_id, bio, positions, tech_tags, topics)
    SELECT u.id,
           'Sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University, chưa tham gia đội thi nào, đang tìm team phù hợp.',
           ARRAY['Frontend Developer'],
           jsonb_build_object('frontend', jsonb_build_array('React', 'Tailwind CSS')),
           ARRAY['Web Development']
    FROM users u
    WHERE u.email IN ('khanh.demo@gmail.com','tung.demo@gmail.com','khoa.demo@gmail.com','tran.demo@gmail.com')
    ON CONFLICT (user_id) DO NOTHING;

    -- ---- 6 account còn lại (trường khác, không cần profile chi tiết) ----
    INSERT INTO users (email, password, full_name, role, active, status, school_name)
    VALUES
        ('member.free1@gmail.com', '123456', 'Nguyễn Thị Mai Anh',  'USER', true, 'ACCEPTED', 'Trường đại học Hoa Sen'),
        ('member.free2@gmail.com', '123456', 'Trần Quang Huy',      'USER', true, 'ACCEPTED', 'Trường đại học Bách Khoa TP.HCM'),
        ('member.free3@gmail.com', '123456', 'Lê Thị Kim Ngân',     'USER', true, 'ACCEPTED', 'Trường đại học Công Nghệ Thông Tin'),
        ('member.free4@gmail.com', '123456', 'Phan Đình Nam',       'USER', true, 'ACCEPTED', 'Trường đại học Khoa Học Tự Nhiên'),
        ('member.free5@gmail.com', '123456', 'Võ Thị Thuý Vy',      'USER', true, 'ACCEPTED', 'Trường đại học Sư Phạm Kỹ Thuật'),
        ('member.free6@gmail.com', '123456', 'Đặng Hoàng Long',     'USER', true, 'ACCEPTED', 'Trường đại học Tôn Đức Thắng')
    ON CONFLICT (email) DO NOTHING;




    -- (Các account user khác tự động insert ở vòng lặp bên dưới)

    v_team_tracks := ARRAY[
        v_track_ai_id, v_track_ai_id, v_track_ai_id, v_track_ai_id, v_track_ai_id, v_track_ai_id, v_track_ai_id,
        v_track_iot_id, v_track_iot_id, v_track_iot_id, v_track_iot_id, v_track_iot_id, v_track_iot_id, v_track_iot_id, v_track_iot_id,
        v_track_blockchain_id, v_track_blockchain_id, v_track_blockchain_id, v_track_blockchain_id, v_track_blockchain_id, v_track_blockchain_id
    ];

    FOR i IN 1..21 LOOP
        v_track_id := v_team_tracks[i];
        v_full_name := first_names[1 + ((v_cursor - 1) % array_length(first_names,1))] || ' ' || last_names[1 + ((v_cursor * 3 - 1) % array_length(last_names,1))];
        v_email := 'demo.s26.team' || LPAD(v_cursor::TEXT, 3, '0') || '@seal.dev';

        INSERT INTO users (email, password, full_name, role, active, status, school_name)
        VALUES (v_email, '123456', v_full_name, 'USER', true, 'ACCEPTED', schools[1 + ((v_cursor - 1) % array_length(schools,1))])
        ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id INTO v_leader_id;
        v_cursor := v_cursor + 1;

        INSERT INTO team (name, description, status, create_at, invite_code, track_id, leader, competition_status)
        VALUES ('Team S26 ' || LPAD(i::TEXT, 2, '0'), 'Đội thi tự động phục vụ demo hệ thống.', 2, CURRENT_DATE, 'S26-' || LPAD(i::TEXT, 2, '0') || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 5), v_track_id, v_leader_id, 0)
        RETURNING id INTO v_team_id;
        v_team_ids := array_append(v_team_ids, v_team_id);

        INSERT INTO member (role, status, team, member, joinmethod) VALUES ('LEADER', 'OFFICAL', v_team_id, v_leader_id, 'CREATETEAM');

        FOR j IN 2..v_team_sizes[i] LOOP
            v_full_name := first_names[1 + ((v_cursor - 1) % array_length(first_names,1))] || ' ' || last_names[1 + ((v_cursor * 3 - 1) % array_length(last_names,1))];
            v_email := 'demo.s26.team' || LPAD(v_cursor::TEXT, 3, '0') || '@seal.dev';

            INSERT INTO users (email, password, full_name, role, active, status, school_name)
            VALUES (v_email, '123456', v_full_name, 'USER', true, 'ACCEPTED', schools[1 + ((v_cursor - 1) % array_length(schools,1))])
            ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id INTO v_user_id;

            INSERT INTO member (role, status, team, member, joinmethod) VALUES ('MEMBER', 'OFFICAL', v_team_id, v_user_id, 'JOINBYCODE');
            v_cursor := v_cursor + 1;
        END LOOP;
    END LOOP;

    -- =========================================================================
    -- BƯỚC 9: Đổ điểm số hardcode (Tuyến tính, Khớp nối chuẩn phân công đa track)
    -- =========================================================================
    FOR i IN 1..21 LOOP
        v_team_id := v_team_ids[i];
        v_track_id := v_team_tracks[i];
        v_is_finalist := (i = ANY(v_finalist_positions));

        -- ---- SUBMISSION VÒNG 1 ----
        INSERT INTO submission (team_id, round_id, github_url, demo_url, document_url, submitted_at, latest)
        VALUES (v_team_id, v_round1_id, 'https://github.com/seal-s26/team-' || LPAD(i::TEXT, 2, '0'), 'https://youtu.be/demo-' || LPAD(i::TEXT, 2, '0'), 'https://seal-s26.dev/slides/team-' || LPAD(i::TEXT, 2, '0') || '.pdf', ('2026-08-16 12:' || LPAD((30 + i)::TEXT, 2, '0') || ':00')::TIMESTAMP, true)
        RETURNING id INTO v_submission_id;

        -- Xác định Judge Assignment ID phù hợp của thầy Tuấn theo đúng track bài nộp (Vòng 1 chỉ có Tuấn chấm, Hà pending)
        IF v_track_id = v_track_ai_id THEN
            v_active_ja_id := v_ja_r1_tuan_ai_id;
        ELSIF v_track_id = v_track_iot_id THEN
            v_active_ja_id := v_ja_r1_tuan_iot_id;
        ELSE
            v_active_ja_id := v_ja_r1_tuan_bc_id; -- Track Blockchain vòng 1 nay cũng do giám khảo Phạm Anh Tuấn chấm để mọi đội đều có điểm
        END IF;

        IF v_active_ja_id IS NOT NULL THEN
            IF v_is_finalist THEN v_target := 7.95 + i * 0.08; ELSE v_target := 5.8 + i * 0.1; END IF;
            s1 := LEAST(10, ROUND(v_target - 0.1, 2)); s2 := LEAST(10, ROUND(v_target + 0.05, 2));
            s3 := LEAST(10, ROUND(v_target - 0.05, 2)); s4 := LEAST(10, ROUND(v_target + 0.1, 2));
            v_total := ROUND(s1 * 0.25 + s2 * 0.30 + s3 * 0.25 + s4 * 0.20, 2);

            INSERT INTO judge_score (judge_assignment_id, submission_id, total_score, submit_at, updated_at, comment, status)
            VALUES (v_active_ja_id, v_submission_id, v_total, ('2026-08-16 13:' || LPAD((30 + i)::TEXT, 2, '0') || ':00')::TIMESTAMP, ('2026-08-16 13:' || LPAD((30 + i)::TEXT, 2, '0') || ':00')::TIMESTAMP, NULL, 'SUBMITTED')
            RETURNING id INTO v_judge_score_id;

            INSERT INTO judge_score_detail (judge_score_id, criterion_id, score, comment) VALUES
                (v_judge_score_id, v_crit_ids[1], s1, NULL), (v_judge_score_id, v_crit_ids[2], s2, NULL),
                (v_judge_score_id, v_crit_ids[3], s3, NULL), (v_judge_score_id, v_crit_ids[4], s4, NULL);
        ELSE
            v_total := 0; -- Dự phòng: không xảy ra nữa vì cả 3 track đều đã có giám khảo chấm ở Vòng 1
        END IF;

        INSERT INTO team_result (created_at, updated_at, team_id, round_id, total_score, status, ranking, is_passed)
        VALUES (NOW(), NOW(), v_team_id, v_round1_id, v_total, 'official', 0, v_is_finalist);

        -- ---- SUBMISSION VÒNG 2 (Chung kết - 6 Đội Finalist) ----
        IF v_is_finalist THEN
            INSERT INTO submission (team_id, round_id, github_url, demo_url, document_url, submitted_at, latest)
            VALUES (v_team_id, v_round2_id, 'https://github.com/seal-s26/team-' || LPAD(i::TEXT, 2, '0'), 'https://youtu.be/final-' || LPAD(i::TEXT, 2, '0'), 'https://seal-s26.dev/slides/team-' || LPAD(i::TEXT, 2, '0') || '-final.pdf', ('2026-08-22 20:' || LPAD((30 + i)::TEXT, 2, '0') || ':00')::TIMESTAMP, true)
            RETURNING id INTO v_submission_id;

            v_round2_score_sum := 0;
            -- 3 Giám khảo chung kết chấm điểm cho mọi track
            FOR k IN 1..3 LOOP
                IF v_track_id = v_track_ai_id THEN
                    v_active_ja_id := CASE k WHEN 1 THEN v_ja_r2_tuan_ai_id WHEN 2 THEN v_ja_r2_long_ai_id ELSE v_ja_r2_kanh_ai_id END;
                ELSIF v_track_id = v_track_iot_id THEN
                    v_active_ja_id := CASE k WHEN 1 THEN v_ja_r2_tuan_iot_id WHEN 2 THEN v_ja_r2_long_iot_id ELSE v_ja_r2_kanh_iot_id END;
                ELSE
                    v_active_ja_id := CASE k WHEN 1 THEN v_ja_r2_tuan_bc_id WHEN 2 THEN v_ja_r2_long_bc_id ELSE v_ja_r2_kanh_bc_id END;
                END IF;

                v_target := 8.4 + i * 0.04 + k * 0.12;
                s1 := LEAST(10, ROUND(v_target - 0.1, 2)); s2 := LEAST(10, ROUND(v_target + 0.05, 2));
                s3 := LEAST(10, ROUND(v_target - 0.05, 2)); s4 := LEAST(10, ROUND(v_target + 0.1, 2));
                v_total := ROUND(s1 * 0.25 + s2 * 0.30 + s3 * 0.25 + s4 * 0.20, 2);
                v_round2_score_sum := v_round2_score_sum + v_total;

                INSERT INTO judge_score (judge_assignment_id, submission_id, total_score, submit_at, updated_at, comment, status)
                VALUES (v_active_ja_id, v_submission_id, v_total, ('2026-08-23 13:' || LPAD((30 + i)::TEXT, 2, '0') || ':00')::TIMESTAMP, ('2026-08-23 13:' || LPAD((30 + i)::TEXT, 2, '0') || ':00')::TIMESTAMP, NULL, 'SUBMITTED')
                RETURNING id INTO v_judge_score_id;

                INSERT INTO judge_score_detail (judge_score_id, criterion_id, score, comment) VALUES
                    (v_judge_score_id, v_crit_ids[1], s1, NULL), (v_judge_score_id, v_crit_ids[2], s2, NULL),
                    (v_judge_score_id, v_crit_ids[3], s3, NULL), (v_judge_score_id, v_crit_ids[4], s4, NULL);
            END LOOP;

            INSERT INTO team_result (created_at, updated_at, team_id, round_id, total_score, status, ranking, is_passed)
            VALUES (NOW(), NOW(), v_team_id, v_round2_id, ROUND(v_round2_score_sum / 3, 2), 'official', 0, false);
        END IF;
    END LOOP;

    -- =========================================================================
    -- Tính toán Ranking tự động theo Track
    -- =========================================================================
    UPDATE team_result tr SET ranking = sub.rnk FROM (
        SELECT tr2.id AS tr_id, RANK() OVER (PARTITION BY t.track_id ORDER BY tr2.total_score DESC) AS rnk
        FROM team_result tr2 JOIN team t ON t.id = tr2.team_id WHERE tr2.round_id = v_round1_id
    ) sub WHERE tr.id = sub.tr_id;

    UPDATE team_result tr SET ranking = sub.rnk FROM (
        SELECT tr2.id AS tr_id, RANK() OVER (PARTITION BY t.track_id ORDER BY tr2.total_score DESC) AS rnk
        FROM team_result tr2 JOIN team t ON t.id = tr2.team_id WHERE tr2.round_id = v_round2_id
    ) sub WHERE tr.id = sub.tr_id;

    -- =========================================================================
    -- Bổ sung current_round / stopped_round / score cho từng team
    -- score = điểm tổng ở vòng gần nhất; current_round = vòng gần nhất; stopped_round = vòng bị loại (NULL nếu vào Chung kết)
    -- =========================================================================
    -- Mặc định: đội dừng ở Vòng 1 (bị loại sau sơ loại)
    UPDATE public.team t SET
        current_round = 'Vòng 1: Sơ loại',
        stopped_round = 'Vòng 1: Sơ loại',
        score = COALESCE((SELECT tr.total_score FROM team_result tr WHERE tr.team_id = t.id AND tr.round_id = v_round1_id), 0)
    WHERE t.track_id IN (v_track_ai_id, v_track_iot_id, v_track_blockchain_id);

    -- Đội vào Chung kết (Top 6): chuyển sang Vòng 2, không bị loại ở sơ loại, điểm lấy theo Vòng 2
    UPDATE public.team t SET
        current_round = 'Vòng 2: Chung kết',
        stopped_round = NULL,
        score = sub.score2
    FROM (SELECT tr.team_id, tr.total_score AS score2 FROM team_result tr WHERE tr.round_id = v_round2_id) sub
    WHERE t.id = sub.team_id;

    RAISE NOTICE '🚀 ĐÃ HOÀN TẤT SEED DATA: Đã thiết lập phân rã đa lời mời và đa phân công bảng đấu chuẩn cho Giám khảo chấm chéo tất cả các Track.';


	-- =========================================================================
    -- BỔ SUNG: Cập nhật team_result_id cho tất cả bản ghi trong bảng judge_score
    -- =========================================================================
    UPDATE judge_score js
    SET team_result_id = tr.id
    FROM submission s
    JOIN team_result tr ON tr.team_id = s.team_id AND tr.round_id = s.round_id
    WHERE js.submission_id = s.id;

    RAISE NOTICE '🚀 Đã cập nhật xong team_result_id cho bảng judge_score!';

	-- =========================================================================
    -- BỔ SUNG: SEED AUDIT LOG CHO CÁC LẦN NỘP ĐIỂM (SCORE_SUBMITTED)
    -- =========================================================================
    INSERT INTO audit_log (
        entity_type, 
        entity_id, 
        action, 
        field_name, 
        old_value, 
        new_value, 
        performed_by, 
        performed_at
    )
    SELECT 
        'JudgeScore' AS entity_type,
        js.id AS entity_id,
        'SCORE_SUBMITTED' AS action,
        'totalScore' AS field_name,
        NULL AS old_value,
        'Tổng: ' || js.total_score AS new_value,
        ja.judge_id AS performed_by,
        js.submit_at AS performed_at
    FROM judge_score js
    JOIN judege_assignment ja ON js.judge_assignment_id = ja.id
    WHERE js.status = 'SUBMITTED';

    RAISE NOTICE '🚀 Đã tạo xong Audit Log cho toàn bộ các lượt chấm điểm (SCORE_SUBMITTED)!';
END $$;

COMMIT;