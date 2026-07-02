import { useState, useMemo, useEffect } from 'react';
import { Plus, FileText, ListDashes, Gear } from '@phosphor-icons/react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

import FormInput from '../../../components/shared/FormInput';
import FormTextarea from '../../../components/shared/FormTextarea';
import Banner from '../../../components/shared/Banner';
import ToggleSwitch from '../../../components/shared/ToggleSwitch';
import AuditLog from '../../../components/shared/AuditLog';
import Badge from '../../../components/shared/Badge';

import CreateRubricHeader from '../../../components/coordinator/rubrics/create/CreateRubricHeader';
import CreateRubricFooter from '../../../components/coordinator/rubrics/create/CreateRubricFooter';
import CriterionCard from '../../../components/coordinator/rubrics/create/CriterionCard';

import axiosClient from '../../../api/axiosClient';
import styles from './CreateRubricPage.module.css';


// { id: 1, name: 'Tính khả thi & Thực tiễn', description: 'Đánh giá khả năng áp dụng sản phẩm vào thực tế, mô hình kinh doanh và khả năng sinh lời.', weight: 35 },
//         { id: 2, name: 'Đổi mới sáng tạo', description: 'Mức độ mới lạ, độc đáo của giải pháp so với các sản phẩm hiện có trên thị trường.', weight: 25 },
//         { id: 3, name: 'Công nghệ & Kỹ thuật', description: 'Độ phức tạp của công nghệ, tính hoàn thiện của source code.', weight: 25 },



//  { userName: 'Admin User', action: 'Cập nhật trọng số "Tính khả thi" lên 35%', time: 'Hôm nay, 10:30' },
//         { userName: 'Bùi Minh Tuấn', action: 'Đổi tên Rubric và thêm mô tả', time: '20/06/2026, 14:15' },
//         { userName: 'Hệ thống', action: 'Tạo mới bản nháp Rubric', time: '18/06/2026, 09:00' },



export default function CreateRubricPage() {


    const navigate = useNavigate();
    const { id } = useParams(); // route: /admin/coordinator/rubrics/create hoặc /:id/edit

    // Mock data giả lập chế độ Edit
    const isEditing = Boolean(id);
    const [loading, setLoading] = useState(isEditing);

    const [inUseCount, setInUseCount] = useState(3);
    const [status, setStatus] = useState('draft'); // 'unsaved' | 'draft' | 'published'
    const [lastUpdated, setLastUpdated] = useState('25/06/2026 10:30');

    const [formData, setFormData] = useState({
        name: 'SEAL Default Hackathon 2026',
        description: 'Bộ tiêu chí mặc định dành cho các vòng thi chung của SEAL Hackathon, tập trung vào khả năng triển khai thực tế và tính sáng tạo.',
        deviationThreshold: 20,
        tieBreaker: true,
    });

    const [criteria, setCriteria] = useState([]);

    const [activeCriterionId, setActiveCriterionId] = useState(null);
    const [logs, setLogs] = useState([]);

    // Lịch sử thao tác mock
    const MOCK_LOGS = [];


    // ── Fetch rubric cũ nếu đang edit ──
    useEffect(() => {
        if (!isEditing) return;

        const fetchRubric = async () => {
            try {
                const res = await axiosClient.get(`/scoring-template/${id}`);
                const data = res.data;

                setFormData({
                    name: data.name,
                    description: data.description,
                    deviationThreshold: data.deviationThreshold,
                    tieBreaker: data.tieBreaker,
                });
                setCriteria(data.criteria.map((c, idx) => ({ ...c, id: c.id ?? idx + 1 })));
                setInUseCount(data.inUseCount ?? 0);
                setStatus(data.status?.toLowerCase() ?? 'draft'); // DRAFT/OFFICIAL -> draft/published
                setLastUpdated(data.updatedAt);
                setLogs(data.auditLogs ?? []);
            } catch (error) {
                console.error('Lỗi khi lấy rubric:', error);
                alert('Không tải được dữ liệu rubric.');
            } finally {
                setLoading(false);
            }
        };

        fetchRubric();
    }, [id, isEditing]);




    // Tự động sắp xếp các tiêu chí theo trọng số (từ cao xuống thấp)
    const sortedCriteria = useMemo(() => {
        return [...criteria].sort((a, b) => (Number(b.weight) || 0) - (Number(a.weight) || 0));
    }, [criteria]);

    // Tính toán trọng số tổng
    const totalWeight = useMemo(() => {
        return criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
    }, [criteria]);

    // Kiểm tra tên bộ tiêu chí không được rỗng
    const isRubricNameValid = formData.name?.trim() !== '';

    // Kiểm tra tất cả tiêu chí phải có tên và trọng số > 0, đồng thời không bị lỗi (error)
    const isCriteriaValid = criteria.length > 0 && criteria.every(c => c.name?.trim() !== '' && c.weight > 0 && !c.error);

    const isValid = totalWeight === 100 && isCriteriaValid && isRubricNameValid;
    const remainingWeight = 100 - totalWeight;

    // Handlers
    const handleAddCriterion = () => {
        const newId = criteria.length > 0 ? Math.max(...criteria.map(c => c.id)) + 1 : 1;
        const newCriterion = { id: newId, name: '', description: '', weight: 0 };
        setCriteria([...criteria, newCriterion]);
        setActiveCriterionId(newId);
    };

    const handleRemoveCriterion = (id) => {
        setCriteria(criteria.filter(c => c.id !== id));
        if (activeCriterionId === id) setActiveCriterionId(null);
    };

    const handleUpdateCriterion = (id, field, value) => {
        setCriteria(criteria.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const handleNavigation = (id) => {
        if (id === 'events') navigate('/admin/coordinator/events');
        if (id === 'rubric') navigate('/admin/coordinator/rubrics');
    };


    // ── Save: dùng chung 1 hàm, chỉ đổi method + status ──
    const saveTemplate = async (targetStatus) => {
        try {
            const formattedCriteria = criteria.map(({ name, description, weight }) => ({
                name,
                description,
                weight: Number(weight),
            }));

            const requestBody = {
                name: formData.name,
                description: formData.description,
                tieBreaker: formData.tieBreaker,
                deviationThreshold: Number(formData.deviationThreshold),
                status: targetStatus, // "DRAFT" | "OFFICIAL"
                criteria: formattedCriteria,
            };

            const response = isEditing
                ? await axiosClient.put(`/scoring-template/${id}`, requestBody)
                : await axiosClient.post('/scoring-template', requestBody);

            const now = new Date();
            const pad = n => n.toString().padStart(2, '0');
            setLastUpdated(`${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`);

            console.log('Response từ BE:', response.data);

            // Nếu vừa tạo mới thành công -> điều hướng sang route edit với id thật
            if (!isEditing && response.data?.id) {
                navigate(`/admin/coordinator/rubrics/${response.data.id}/edit`, { replace: true });
            }
        } catch (error) {
            console.error('Lỗi khi lưu template:', error);
            const errorMsg = error.response?.data || 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.';
            alert(errorMsg);
        }
    };

    const handleSaveTemplateDraft = () => saveTemplate('DRAFT');
    const handleSaveTemplate = () => saveTemplate('OFFICIAL');

    // if (loading) return <div className={styles.pageWrapper}>Đang tải...</div>;





    return (
        <div className={styles.pageWrapper} onClick={() => setActiveCriterionId(null)}>
            <CreateRubricHeader
                isEditing={isEditing}
                lastUpdated={lastUpdated}
            />

            {/* ── Blue Banner Header ── */}
            <div className={styles.blueHeader}>
                <FileText size={32} weight="fill" className={styles.blueHeaderIcon} />
                <div className={styles.blueHeaderContent}>
                    <div className={styles.blueHeaderTitleRow}>
                        <h1 className={styles.blueHeaderTitle}>
                            {formData.name || 'Rubric mới'}
                        </h1>
                        {status === 'unsaved' && <Badge variant="gray" label="Chưa lưu" />}
                        {status === 'draft' && <Badge variant="dashedOrange" label="Lưu nháp" />}
                    </div>
                    <p className={styles.blueHeaderDesc}>
                        Thiết lập các tiêu chí đánh giá, cấu hình trọng số và các quy tắc chấm điểm nâng cao cho rubric.
                    </p>
                </div>
            </div>

            <div className={styles.page}>
                <div className={styles.body}>

                    {/* ================= LEFT COLUMN: Form ================= */}
                    <div className={styles.leftCol}>

                        {/* Section 1: Thông tin chung */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <FileText size={16} weight="bold" className={styles.sectionTitleIcon} />
                                Thông tin chung
                            </h2>

                            <div className={styles.formRow}>
                                <FormInput
                                    label="Tên bộ tiêu chí"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="VD: Tiêu chí vòng sơ loại..."
                                />

                                <FormTextarea
                                    label="Mô tả / Mục đích sử dụng"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Mô tả ngắn gọn về hoàn cảnh sử dụng của bộ tiêu chí này..."
                                    rows={3}
                                />
                            </div>
                        </section>

                        {/* Section 2: Tiêu chí đánh giá */}
                        <section className={styles.section}>
                            <div className={styles.criteriaHeader}>
                                <h2 className={styles.sectionTitle}>
                                    <ListDashes size={16} weight="bold" className={styles.sectionTitleIcon} />
                                    Danh sách Tiêu chí
                                </h2>
                            </div>

                            <div className={styles.criteriaList}>
                                {sortedCriteria.map((criterion) => (
                                    <motion.div
                                        key={criterion.id}
                                        layout
                                        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                                    >
                                        <CriterionCard
                                            criterion={criterion}
                                            isActive={activeCriterionId === criterion.id}
                                            onClick={() => setActiveCriterionId(criterion.id)}
                                            onUpdate={(field, value) => handleUpdateCriterion(criterion.id, field, value)}
                                            onDelete={() => handleRemoveCriterion(criterion.id)}
                                        />
                                    </motion.div>
                                ))}

                                {criteria.length === 0 && (
                                    <div className={styles.emptyState}>
                                        <p>Chưa có tiêu chí nào. Bấm "Thêm tiêu chí" để bắt đầu.</p>
                                    </div>
                                )}

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddCriterion();
                                    }}
                                    className={styles.addBtn}
                                >
                                    <Plus size={16} weight="bold" /> Thêm tiêu chí
                                </button>
                            </div>
                        </section>

                        {/* Section 3: Cài đặt nâng cao */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <Gear size={16} weight="bold" className={styles.sectionTitleIcon} />
                                Cài đặt nâng cao
                            </h2>

                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <h4>Ngưỡng độ lệch chuẩn cảnh báo</h4>
                                    <p>Hệ thống sẽ cảnh báo nếu điểm số giữa các giám khảo cho cùng một đội chênh lệch vượt quá phần trăm này.</p>
                                </div>
                                <div className={styles.settingAction}>
                                    <div className={styles.thresholdWrapper}>
                                        <input
                                            type="number"
                                            value={formData.deviationThreshold}
                                            onChange={(e) => setFormData({ ...formData, deviationThreshold: e.target.value })}
                                            className={styles.thresholdInput}
                                            min="0"
                                            max="100"
                                        />
                                        <span className={styles.percentSign}>%</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <h4>Quy tắc Tie-breaking (Phá vỡ thế hòa)</h4>
                                    <p>Tự động ưu tiên đội có điểm cao hơn ở tiêu chí có trọng số lớn nhất nếu tổng điểm bằng nhau.</p>
                                </div>
                                <div className={styles.settingAction}>
                                    <ToggleSwitch
                                        checked={formData.tieBreaker}
                                        onChange={(val) => setFormData({ ...formData, tieBreaker: val })}
                                    />
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* ================= RIGHT COLUMN: Warnings & History ================= */}
                    <div className={styles.rightCol}>

                        {isEditing && inUseCount > 0 && (
                            <Banner
                                type="warning"
                                title="Rubric đang được sử dụng"
                                message={<>Bộ tiêu chí này hiện đang được gắn vào <strong>{inUseCount} vòng thi</strong>. Mọi thay đổi mới sẽ chỉ áp dụng cho các lượt chấm điểm từ thời điểm lưu trở đi và không làm thay đổi điểm số của bài nộp đã được chấm.</>}
                            />
                        )}

                        {isEditing && (
                            <AuditLog logs={MOCK_LOGS} />
                        )}

                    </div>

                </div>

                <CreateRubricFooter
                    totalWeight={totalWeight}
                    criteria={sortedCriteria}
                    isValid={isValid}
                    onCancel={() => navigate('/admin/coordinator/rubrics')}
                    onSaveDraft={handleSaveTemplateDraft}
                    onSave={handleSaveTemplate}
                />

            </div>
        </div>
    );
}
