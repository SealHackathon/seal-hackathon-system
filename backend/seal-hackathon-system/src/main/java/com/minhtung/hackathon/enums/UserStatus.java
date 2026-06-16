package com.minhtung.hackathon.enums;

public enum UserStatus {
    PROFILE_PENDING, // cai nay se la da login duoc nhung chua bo sung ho so chua dc admin duyet
    KYC_PENDING, // cho digit xu ly (digit o day la phan mềm quét cccd )
    PENDING_APPROVAL,//da du ho so , cho admin duyet
    ACCEPTED,
    REJECTED,
    BANNED
}
