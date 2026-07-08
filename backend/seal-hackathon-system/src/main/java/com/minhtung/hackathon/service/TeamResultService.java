package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.response.TeamResultResponse;
import com.minhtung.hackathon.entity.Round;
import com.minhtung.hackathon.entity.Team;
import com.minhtung.hackathon.entity.TeamResult;
import com.minhtung.hackathon.entity.Track;
import com.minhtung.hackathon.enums.RankingScope;
import com.minhtung.hackathon.enums.TeamResultStatus;
import com.minhtung.hackathon.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;


@Service
    @RequiredArgsConstructor
    public class TeamResultService {

        private final TeamResultRepository teamResultRepository;
        private final TrackRepository trackRepository;
        private final RoundRepository roundRepository;
        private final EventRepository eventRepository;
    private final EventService eventService;

    @Transactional
        public List<TeamResultResponse> getTrackRanking(Long trackId, Long roundId) {
            if (!trackRepository.existsById(trackId)) {
                throw new RuntimeException("khong tim thay track");
            }

            Round round = roundRepository.findById(roundId)
                    .orElseThrow(() -> new RuntimeException("khong tim thay round"));
            Track track = trackRepository.findById(trackId)
                    .orElseThrow(() -> new RuntimeException("khong tim thay track"));

            if (track.getEvent().getId()
                    != round.getEvent().getId()) {
                throw new RuntimeException(
                        "Track và Round không cùng Event"
                );
            }

            List<TeamResult> results =
                    teamResultRepository.findByTeamTrackIdAndRoundIdOrderByTotalScoreDesc(trackId, roundId);

            return mapAndRecalculateRanking(results);
        }

        @Transactional
        public List<TeamResultResponse>getRoundRanking(
                Long roundId
        ){
            if(!roundRepository.existsById(roundId)){
                throw  new RuntimeException("khong tim thay round");
            }
            List<TeamResult>results = teamResultRepository.findByRoundIdOrderByTotalScoreDesc(roundId);
            return mapAndRecalculateRanking(results);
        }
        @Transactional
        public List<TeamResultResponse> getEventRanking(
                Long eventId
        ){
            if(!eventRepository.existsById(eventId)){
                throw new RuntimeException("khong tim thay event");
            }
            List<EventRankingProjection>result = teamResultRepository.findEventRanking(eventId);

            AtomicInteger ranking = new AtomicInteger(1);
            return result.stream()
                    .map(item ->
                            mapEventProjection(
                                    item,
                                    ranking.getAndIncrement()
                            )
                    )
                    .toList();
        }

        @Transactional
        public void publishTrackResults(Long trackId , Long roundId){
        if(!trackRepository.existsById(trackId)){
            throw new RuntimeException("khong tim thay track") ;
        }
        if(!roundRepository.existsById(roundId)){
            throw new RuntimeException("khong tim thay round") ;
        }
        int updated = teamResultRepository.publishTrackResults(trackId,roundId, TeamResultStatus.PUBLISHED);

        if(updated == 0 ){
            throw  new RuntimeException("khong co ket qua nao de cong bo ");
        }

        }
    @Transactional
    public List<TeamResultResponse> getPublicRanking(
            RankingScope scope,
            Long id,
            Long roundId
    ) {
        return switch (scope) {
            case TRACK -> {
                if (roundId == null) {
                    throw new RuntimeException(
                            "roundId là bắt buộc khi xem Track"
                    );
                }

                List<TeamResult> results =
                        teamResultRepository
                                .findByTeamTrackIdAndRoundIdAndStatusOrderByTotalScoreDesc(
                                        id,
                                        roundId,
                                        TeamResultStatus.PUBLISHED
                                );

                yield mapAndRecalculateRanking(results);
            }

            case ROUND -> {
                List<TeamResult> results =
                        teamResultRepository
                                .findByRoundIdAndStatusOrderByTotalScoreDesc(
                                        id,
                                        TeamResultStatus.PUBLISHED
                                );

                yield mapAndRecalculateRanking(results);
            }

            case EVENT -> {
                List<EventRankingProjection> results =
                        teamResultRepository
                                .findPublishedEventRanking(
                                        id,
                                        TeamResultStatus.PUBLISHED
                                );

                AtomicInteger ranking =
                        new AtomicInteger(1);

                yield results.stream()
                        .map(item ->
                                mapEventProjection(
                                        item,
                                        ranking.getAndIncrement()
                                )
                        )
                        .toList();
            }
        };
    }

        private TeamResultResponse mapToResponse(TeamResult result, int ranking) {
            Team team = result.getTeam();
            Round round = result.getRound();
            Track track = team.getTrack();

            return TeamResultResponse.builder()
                    .teamReasultId(result.getId())
                    .teamId(team.getId())
                    .teamName(team.getName())
                    .trackId(track.getId())
                    .trackName(track.getName())
                    .RoundId(round.getId())
                    .roundName(round.getName())
                    .totalScore(result.getTotalScore())
                    .ranking(ranking)
                    .passed(result.isPassed())
                    .status(result.getStatus().name())
                    .build();
        }

        private List<TeamResultResponse> mapAndRecalculateRanking(List<TeamResult> results) {
            AtomicInteger ranking = new AtomicInteger(1);

            return results.stream()
                    .map(result -> mapToResponse(result, ranking.getAndIncrement()))
                    .toList();
        }
    private TeamResultResponse mapEventProjection(
            EventRankingProjection item,
            int ranking
    ) {
        return TeamResultResponse.builder()
                .teamId(item.getTeamId())
                .teamName(item.getTeamName())
                .trackId(item.getTrackId())
                .trackName(item.getTrackName())
                .totalScore(
                        Math.round(
                                item.getAverageScore() * 100.0
                        ) / 100.0
                )
                .ranking(ranking)
                .status("AGGREGATED")
                .build();
    }
    }

