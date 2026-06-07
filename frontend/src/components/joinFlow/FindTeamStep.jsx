import { useState } from 'react'
import ModalShell from '../shared/ModalShell'
import StepFooter from '../shared/StepFooter'
import CardSearchBase from '../shared/CardSearchBase'
import TeamCard from '../noTeamView/TeamCard'
import styles from '../shared/CardSearchBase.module.css'

const PAGE_SIZE = 6

export const FAKE_TEAMS = [
    {
        id: 1,
        name: 'Pixel Pioneers',
        description: 'Team mình thiên về UI/UX và frontend, mong muốn tìm hướng tiếp cận bài toán từ góc độ trải nghiệm người dùng. Rất mong có thêm người có tư duy thiết kế hoặc biết làm việc với Figma.',
        maxSlots: 5,
        isRequested: false,
        members: [{ id: 1 }, { id: 2 }, { id: 3 }],
    },
    {
        id: 2,
        name: 'Code Breakers',
        description: 'Nhóm mình chủ yếu làm backend, đang cần thêm người có thể đảm nhận phần giao diện. Định hướng chung là muốn giải quyết bài toán liên quan đến kết nối và quản lý thông tin.',
        maxSlots: 5,
        isRequested: false,
        members: [{ id: 4 }, { id: 5 }],
    },
    {
        id: 3,
        name: 'DataFlow',
        description: 'Team có background về data và phân tích, muốn tiếp cận đề thi theo hướng khai thác dữ liệu để đưa ra insight hữu ích. Đang tìm thêm người có thể lập trình hoặc trình bày tốt.',
        maxSlots: 5,
        isRequested: false,
        members: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }],
    },
    {
        id: 4,
        name: 'Green Tech',
        description: 'Mình quan tâm đến các vấn đề có tác động xã hội và môi trường. Dù chưa biết đề nhưng team muốn định hướng giải pháp mang lại giá trị thực tế cho cộng đồng, không chỉ dừng lại ở demo.',
        maxSlots: 5,
        isRequested: false,
        members: [{ id: 10 }, { id: 11 }, { id: 12 }],
    },
    {
        id: 5,
        name: 'HealthBridge',
        description: 'Team có định hướng về công nghệ ứng dụng trong cuộc sống hàng ngày. Mình muốn tìm người có thể bổ trợ kỹ năng kỹ thuật hoặc có ý tưởng tốt để cùng brainstorm khi có đề.',
        maxSlots: 5,
        isRequested: false,
        members: [{ id: 13 }, { id: 14 }],
    },
    {
        id: 6,
        name: 'SmartCampus',
        description: 'Nhóm mình gồm các bạn có kinh nghiệm làm dự án thực tế, quen với quy trình từ ý tưởng đến sản phẩm. Đang tìm thêm thành viên chủ động, không ngại đóng góp ý kiến.',
        maxSlots: 5,
        isRequested: false,
        members: [{ id: 15 }, { id: 16 }, { id: 17 }],
    },
    {
        id: 7,
        name: 'EduConnect',
        description: 'Team thiên về các giải pháp hỗ trợ học tập và kết nối người với người. Chưa rõ đề nhưng mình muốn làm sản phẩm mà sinh viên thực sự muốn dùng, không chỉ để chấm điểm.',
        maxSlots: 5,
        isRequested: false,
        members: [{ id: 18 }, { id: 19 }, { id: 20 }],
    },
    {
        id: 8,
        name: 'ByteBuilders',
        description: 'Nhóm mới lập, gồm các bạn năm 2-3 muốn thử sức lần đầu với hackathon. Mình cần thêm người để học hỏi lẫn nhau, không đặt nặng thành tích mà tập trung vào trải nghiệm.',
        maxSlots: 5,
        isRequested: false,
        members: [{ id: 21 }],
    },
    {
        id: 9,
        name: 'MapMind',
        description: 'Team thích tiếp cận bài toán một cách có hệ thống, phân tích kỹ trước khi làm. Định hướng muốn xây dựng giải pháp có logic rõ ràng, dễ trình bày trước ban giám khảo.',
        maxSlots: 5,
        isRequested: false,
        members: [{ id: 22 }, { id: 23 }, { id: 24 }],
    },
    {
        id: 10,
        name: 'SecureNet',
        description: 'Nhóm mình có thế mạnh về bảo mật và hạ tầng hệ thống. Dù chưa biết đề thi nhưng mình muốn tiếp cận theo hướng xây dựng giải pháp chắc chắn, ít lỗi và có khả năng mở rộng.',
        maxSlots: 5,
        isRequested: false,
        members: [{ id: 25 }, { id: 26 }],
    },
    {
        id: 11,
        name: 'CloudNine',
        description: 'Team đang tìm người bổ sung kỹ năng còn thiếu. Mình muốn có đội đa dạng — vừa code được, vừa có người nghĩ được ý tưởng và trình bày tốt. Cùng nhau figuring out khi có đề.',
        maxSlots: 5,
        isRequested: false,
        members: [{ id: 27 }, { id: 28 }, { id: 29 }],
    },
    {
        id: 12,
        name: 'AR Makers',
        description: 'Nhóm mình thích thử nghiệm công nghệ mới và không ngại đi theo hướng ít người làm. Muốn tìm thành viên có tư duy sáng tạo, sẵn sàng thử cách tiếp cận khác biệt.',
        maxSlots: 5,
        isRequested: false,
        members: [{ id: 30 }, { id: 31 }],
    },
]

function FindTeamStep({ onClose, onBack, onSubmit, standalone = false }) {
    const [search, setSearch]           = useState('')
    const [fptOnly, setFptOnly]         = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [requests, setRequests]       = useState({})

    const filtered = FAKE_TEAMS.filter(team =>
        team.name.toLowerCase().includes(search.toLowerCase())
    )

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

    const paged = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    )

    function handleRequest(teamId, message) {
        console.log('Xin vào đội:', teamId, message)
        setRequests(prev => ({ ...prev, [teamId]: true }))
    }

    function handleCancel(teamId) {
        console.log('Hủy yêu cầu:', teamId)
        setRequests(prev => ({ ...prev, [teamId]: false }))
    }

    const hasRequested = Object.values(requests).some(Boolean)

    return (
        <ModalShell
            onClose={() => { onClose() }}
            size=""
            footer={standalone 
                ? null
                :
                    <StepFooter
                        currentStep={3}
                        totalSteps={3}
                        stepLabel="Xin vào đội"
                        onBack={onBack}
                        onNext={() => onSubmit({ requests })}
                        nextLabel="Xác nhận"
                        nextDisabled={!hasRequested}
                    />
            }
        >
            <div className={styles.findTeamContent}>
                <h1 className={styles.title}>Xin vào đội</h1>

            <p className={styles.subtitle}>
                Tìm đội phù hợp và gửi yêu cầu gia nhập. Đội trưởng sẽ xét duyệt yêu cầu của bạn.
            </p>

            <CardSearchBase
                items={paged}
                renderCard={(team) => (
                    <TeamCard
                        key={team.id}
                        team={team}
                        onRequest={handleRequest}
                        onCancel={handleCancel}
                    />
                )}
                searchPlaceholder="Tìm kiếm tên đội"
                search={search}
                onSearchChange={(val) => { setSearch(val); setCurrentPage(1) }}
                fptOnly={fptOnly}
                onFptChange={setFptOnly}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
            </div>

            
        </ModalShell>
    )
}

export default FindTeamStep