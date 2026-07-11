package com.minhtung.hackathon.entity;

import com.minhtung.hackathon.enums.EventStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "event")
@Getter
@Setter
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private LocalDateTime createAt;

    //sau nay doi ve enum
    @Column(length = 255, columnDefinition = "text")
    private String description;

    //sau nay doi ve enum
    @Column(length = 255, columnDefinition = "text")
    private String descriptionDetail;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, name = "status")
    private EventStatus status;

    @Column
    private int minTeamMember;

    @Column(length = 255)
    private String topic;

    @Column(length = 255)
    private String bannerImg;

    @Column(length = 255)
    private String thumbnail_image;

    private LocalDateTime openRegisterTime;
    private LocalDateTime closeRegisterTime;
    private LocalDateTime cofirmTeamTime;


    @Column
    private int maxTeamMember;

    @Column(length = 255, columnDefinition = "text")
    private String rules;

    @Column
    private String eventLocation;

    @Column(columnDefinition = "text")
    private String participationBenefits;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private String[]  keywords;


    @OneToMany(mappedBy = "event",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Milestone> milestones = new ArrayList<>();

    @OneToMany(mappedBy = "event",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Prize> prizes = new ArrayList<>();

    @OneToMany(mappedBy = "event",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Round> rounds = new ArrayList<>();

    private int maxTeam;

    @OneToMany(mappedBy = "event",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Track> tracks = new ArrayList<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventNote> notes; // những lưu ý của event


    public Event() {
    }

    public Event(String name, LocalDateTime createAt, String description, EventStatus status, int minTeamMember, String topic, String bannerImg, String thumbnail_image, int maxTeamMember, String rules, String participationBenefits, String eventLocation) {
        this.name = name;
        this.createAt = createAt;
        this.description = description;
        this.status = status;
        this.minTeamMember = minTeamMember;
        this.topic = topic;
        this.bannerImg = bannerImg;
        this.thumbnail_image = thumbnail_image;
        this.maxTeamMember = maxTeamMember;
        this.rules = rules;
        this.participationBenefits = participationBenefits;
        this.eventLocation = eventLocation;
    }


    public void setMaxTeam(int maxTeam) {
        this.maxTeam = maxTeam;
    }

    public int getMaxTeam() {
        int maxTeam=0;
        for(Track item : tracks){
            maxTeam+=item.getMaxTeamPerTrack();
        }

        return maxTeam;
    }
}
