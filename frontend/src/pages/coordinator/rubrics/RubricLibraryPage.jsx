import React, { useState, useMemo } from 'react';
import { MagnifyingGlass, Plus, Trophy } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import RubricList from '../../../components/coordinator/rubrics/RubricList';
import Button from '../../../components/shared/Button';
import FormInput from '../../../components/shared/FormInput';
import Dropdown from '../../../components/shared/Dropdown';
import CoordinatorLayout from '../../../layouts/CoordinatorLayout';
import SectionHeader from '../../../components/shared/SectionHeader';
import styles from './RubricLibraryPage.module.css';

const MOCK_RUBRICS = [
    {
        id: 1,
        name: 'SEAL Default Hackathon 2026',
        description: 'Bộ tiêu chí mặc định dành cho các vòng thi chung của SEAL Hackathon, tập trung vào khả năng triển khai thực tế và tính sáng tạo.',
        lastModified: '2026-06-25T10:30:00',
        usageCount: 3,
        isDraft: false,
        criteria: [
            { name: 'Tính khả thi & Thực tiễn', weight: 30, description: 'Đánh giá khả năng áp dụng sản phẩm vào thực tế, mô hình kinh doanh và khả năng sinh lời hoặc tạo tác động xã hội.' },
            { name: 'Đổi mới sáng tạo', weight: 25, description: 'Mức độ mới lạ, độc đáo của giải pháp so với các sản phẩm hiện có trên thị trường.' },
            { name: 'Công nghệ & Kỹ thuật', weight: 25, description: 'Độ phức tạp của công nghệ, tính hoàn thiện của source code và kiến trúc hệ thống.' },
            { name: 'Thiết kế UI/UX', weight: 10, description: 'Đánh giá giao diện thân thiện, trải nghiệm người dùng mượt mà và tính thẩm mỹ cao.' },
            { name: 'Kỹ năng thuyết trình', weight: 10, description: 'Khả năng trình bày ý tưởng rõ ràng, logic, quản lý thời gian tốt và trả lời câu hỏi thuyết phục.' },
        ]
    },
    {
        id: 2,
        name: 'Vòng Sơ Loại - Ý tưởng (Idea Pitching)',
        description: 'Dành riêng cho vòng sơ loại để đánh giá tiềm năng của ý tưởng trước khi bước vào giai đoạn phát triển sản phẩm.',
        lastModified: '2026-07-01T08:15:00',
        usageCount: 1,
        isDraft: false,
        criteria: [
            { name: 'Tính sáng tạo của ý tưởng', weight: 40, description: 'Ý tưởng mang tính đột phá, không trùng lặp và có cách tiếp cận vấn đề mới mẻ.' },
            { name: 'Nghiên cứu thị trường', weight: 30, description: 'Minh chứng được nhu cầu thực tế của người dùng thông qua khảo sát và phân tích đối thủ.' },
            { name: 'Mô hình kinh doanh', weight: 30, description: 'Kế hoạch phát triển dự án, doanh thu dự kiến và các kênh tiếp cận khách hàng.' },
        ]
    },
    {
        id: 3,
        name: 'Tiêu chí phụ - Thiết kế UI/UX',
        description: 'Bộ tiêu chí chuyên sâu về trải nghiệm người dùng và giao diện, dùng để tham khảo hoặc chấm điểm phụ.',
        lastModified: '2026-07-02T14:20:00',
        usageCount: 0,
        isDraft: true,
        criteria: [
            { name: 'Thẩm mỹ & Bố cục', weight: 40, description: 'Sự cân đối trong bố cục, sử dụng màu sắc, typography phù hợp với thương hiệu và đối tượng.' },
            { name: 'Trải nghiệm người dùng (UX)', weight: 40, description: 'Luồng thao tác (user flow) tự nhiên, giảm thiểu số bước thừa, chú trọng tính tiện dụng (usability).' },
        ]
    },
    {
        id: 4,
        name: 'Web3 / Blockchain Track',
        description: 'Đánh giá các dự án thuộc lĩnh vực Blockchain, đặc biệt chú trọng vào kiến trúc phi tập trung và bảo mật Smart Contract.',
        lastModified: '2026-06-15T09:00:00',
        usageCount: 0,
        isDraft: false,
        criteria: [
            { name: 'Kiến trúc phi tập trung', weight: 35, description: 'Khả năng ứng dụng hiệu quả tính phi tập trung của blockchain thay vì chỉ là database thông thường.' },
            { name: 'Bảo mật Smart Contract', weight: 35, description: 'Mã nguồn mở an toàn, tối ưu phí gas và không có lỗ hổng bảo mật nghiêm trọng.' },
            { name: 'Ứng dụng thực tiễn', weight: 30, description: 'Sản phẩm có khả năng tích hợp và mang lại giá trị thực tế cho người dùng Web3.' },
        ]
    }
];

export default function RubricLibraryPage() {
    const navigate = useNavigate();
    const [rubrics, setRubrics] = useState(MOCK_RUBRICS);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date_desc');

    const processedRubrics = useMemo(() => {
        let result = [...rubrics];

        if (searchQuery) {
            result = result.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        result.sort((a, b) => {
            if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
            if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
            if (sortBy === 'usage_desc') return b.usageCount - a.usageCount;
            if (sortBy === 'date_asc') return new Date(a.lastModified) - new Date(b.lastModified);
            // Default: date_desc
            return new Date(b.lastModified) - new Date(a.lastModified);
        });

        return result;
    }, [rubrics, searchQuery, sortBy]);

    // TODO: Gọi API lấy danh sách rubric
    // const fetchRubrics = async () => {
    //     const res = await axiosClient.get('/api/rubrics');
    //     setRubrics(res.data);
    // };
    // useEffect(() => { fetchRubrics(); }, []);

    const handleDelete = async (id) => {
        // TODO: Gọi API xóa rubric theo id
        // await axiosClient.delete(`/api/rubrics/${id}`);
        // fetchRubrics();
    };

    const handleDuplicate = async (id) => {
        // TODO: Gọi API nhân bản rubric theo id
        // await axiosClient.post(`/api/rubrics/${id}/duplicate`);
        // fetchRubrics();
    };

    const handleEdit = (id) => {
        // Chuyển hướng sang trang edit
        navigate(`/admin/coordinator/rubrics/create/${id}`);
    };

    const handleNavigation = (id) => {
        if (id === 'events') navigate('/admin/coordinator/events');
        if (id === 'rubric') navigate('/admin/coordinator/rubrics');
    };

    return (
        <CoordinatorLayout activePage="rubric" onNavigate={handleNavigation}>
            <div className={styles.page}>
                <div className={styles.topRow}>
                    <SectionHeader
                        icon={Trophy}
                        title="Thư viện Rubric"
                        level="h1"
                    />
                    <Button
                        label="Tạo rubric mới"
                        icon={Plus}
                        variant="primary"
                        color="green"
                        onClick={() => navigate('/admin/coordinator/rubrics/create')}
                    />
                </div>

                <div className={styles.pageContainer}>
                    <div className={styles.maxWidthWrapper}>

                        <div className={styles.toolbar}>
                            <div className={styles.searchBox}>
                                <FormInput
                                    iconLeft={MagnifyingGlass}
                                    placeholder="Tìm kiếm rubric theo tên..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className={styles.sortBox}>
                                <Dropdown
                                    label="Sắp xếp:"
                                    labelPosition="side"
                                    value={sortBy}
                                    onChange={setSortBy}
                                    options={[
                                        { value: "date_desc", label: "Cập nhật gần nhất" },
                                        { value: "date_asc", label: "Cập nhật cũ nhất" },
                                        { value: "usage_desc", label: "Được sử dụng nhiều nhất" },
                                        { value: "name_asc", label: "Tên (A-Z)" },
                                        { value: "name_desc", label: "Tên (Z-A)" }
                                    ]}
                                />
                            </div>
                        </div>

                        <RubricList
                            rubrics={processedRubrics}
                            searchQuery={searchQuery}
                            onDelete={handleDelete}
                            onDuplicate={handleDuplicate}
                            onEdit={handleEdit}
                        />
                    </div>
                </div>
            </div>
        </CoordinatorLayout>
    );
}
