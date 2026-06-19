package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.MilestoneRequest;
import com.minhtung.hackathon.entity.Event;
import com.minhtung.hackathon.entity.Milestone;
import com.minhtung.hackathon.repository.EventRepository;
import com.minhtung.hackathon.repository.MilestoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final EventRepository eventRepository;

    public List<Milestone> getAllMilestones() {
        return milestoneRepository.findAll();
    }

    public List<Milestone> getMilestonesByEventId(Long eventId) {
        return milestoneRepository.findByEventId(eventId);
    }

    public Milestone getMilestoneById(Long id) {
        return milestoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Milestone với ID: " + id));
    }

    @Transactional
    public Milestone createMilestone(MilestoneRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event với ID: " + request.getEventId()));

        Milestone milestone = new Milestone();
        milestone.setEvent(event);
        mapRequestToEntity(request, milestone);

        return milestoneRepository.save(milestone);
    }

//    @Transactional
//    public Milestone updateMilestone(Long id, MilestoneRequest request) {
//        Milestone milestone = getMilestoneById(id);
//
//        mapRequestToEntity(request, milestone);
//
//        if (request.getEventId() != null && !milestone.getEvent().getId().equals(request.getEventId())) {
//            Event newEvent = eventRepository.findById(request.getEventId())
//                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Event với ID: " + request.getEventId()));
//            milestone.setEvent(newEvent);
//        }
//
//        return milestoneRepository.save(milestone);
//    }

    @Transactional
    public void deleteMilestone(Long id) {
        Milestone milestone = getMilestoneById(id);
        milestoneRepository.delete(milestone);
    }

    private void mapRequestToEntity(MilestoneRequest request, Milestone milestone) {
        milestone.setMilestoneName(request.getMilestoneName());
        milestone.setDateStart(request.getDateStart());
        milestone.setDateEnd(request.getDateEnd());
        milestone.setDes(request.getDes());
    }
}