package com.minhtung.hackathon.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Value;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class University {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;

    //nay la noi de ki hieu truong nhu fpt,uit,uih
    @Column(nullable = false, unique = true)
    private String code ;
    @Column(nullable = false)
    private String name ;

    //true la can check msss(sv fpt ) , false la sv trường khác (ko cần check mssv)
    @Column(nullable = false)
    private Boolean checkMssv ;

    public boolean isCheckMssv() {
        return checkMssv;
    }
}
