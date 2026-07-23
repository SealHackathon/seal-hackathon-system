package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "round_track")
@Data
@NoArgsConstructor
public class RoundTrack {
    @EmbeddedId
    private RoundTrackId id; // Khóa chính tổ hợp (round_id, track_id)

    @ManyToOne
    @MapsId("roundId")
    private Round round;

    @ManyToOne
    @MapsId("trackId")
    private Track track;

    @Column(name = "publish_stage")
    private Integer publishStage = 1; // 1: Đóng Stage 1, 2: Stage 2, 3: Stage 3



    @Embeddable
    public static class RoundTrackId implements java.io.Serializable {
        @Column(name = "round_id")
        private Long roundId;

        @Column(name = "track_id")
        private Long trackId;

        public RoundTrackId() {}
        public RoundTrackId(Long roundId, Long trackId) {
            this.roundId = roundId;
            this.trackId = trackId;
        }
        // Thêm Getter, Setter, equals() và hashCode() tương tự như cách 1 nhé!
    }
}