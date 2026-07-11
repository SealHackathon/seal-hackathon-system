export function handleSaveDraft({ currentStep, formData, axiosClient, handleFormChange }) {
  console.log(`Bắt đầu lưu nháp cho Step ${currentStep}`);

  // Khởi tạo object lưu promise nếu chưa có để dùng chung cho tất cả các step
  if (!handleSaveDraft.activePromises) {
    handleSaveDraft.activePromises = {};
  }

  // Nếu step hiện tại đang có request chạy ngầm, bắt request sau "đi ké" kết quả của request trước
  if (handleSaveDraft.activePromises[currentStep]) {
    console.log(`[Step ${currentStep}] Request trùng lặp - Đang dùng chung kết quả với request trước`);
    return handleSaveDraft.activePromises[currentStep];
  }

  // Hàm helper chuyển Date thành chuỗi local ISO (không có chữ Z và bù trừ múi giờ)
  const toLocalISOString = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  let apiEndpoint = '/event';
  let currentPromise = null;

  switch (currentStep) {
    case 1: {
      const sendData = new FormData();
      if (formData.id) sendData.append('id', formData.id);

      sendData.append('name', formData.name || '');
      sendData.append('descriptionDetails', formData.detailDesc || '');
      sendData.append('topic', formData.theme || '');
      sendData.append('description', formData.shortDesc || '');
      sendData.append('minTeamMember', formData.minMembers || 1);
      sendData.append('maxTeamMember', formData.maxMembers || 5);

      if (formData.openDate) sendData.append('openRegisterTime', toLocalISOString(formData.openDate));
      if (formData.closeDate) sendData.append('closeRegisterTime', toLocalISOString(formData.closeDate));
      if (formData.teamDeadline) sendData.append('cofirmTeamTime', toLocalISOString(formData.teamDeadline));

      if (formData.avatarFile instanceof File) {
        sendData.append("thumbnailFile", formData.avatarFile);
      }

      if (formData.coverFile instanceof File) {
        sendData.append("bannerFile", formData.coverFile);
      }

      // Gửi URL ảnh hiện tại để backend giữ nguyên nếu không upload ảnh mới
      if (formData.bannerImg) {
        sendData.append("bannerImg", formData.bannerImg);
      }

      if (formData.thumbnail_image) {
        sendData.append("thumbnail_image", formData.thumbnail_image);
      }

      const method = formData.id ? 'put' : 'post';
      const url = formData.id ? `${apiEndpoint}/${formData.id}` : apiEndpoint;

      currentPromise = axiosClient[method](url, sendData)
        .then(response => {
          console.log(`Lưu bản nháp Step 1 thành công!`, response.data);
          if (response.data && response.data.eventId) {
            handleFormChange('id', response.data.eventId);
          }
          return true;
        })
        .catch(error => {
          console.log(error.response);
          console.log(error.response?.status);
          console.log(error.response?.data);
          console.log(error.response?.headers);
          const errorMsg = error.response?.data?.message || error.response?.data || error.message;
          alert(`Không thể lưu bản nháp Step 1: ` + errorMsg);
          return false;
        });
      break;
    }

    case 2: {
      const step2Payload = {
        eventId: formData.id,
        eventRules: formData.generalRules || '',
        notes: (formData.notes || []).map(note => ({
          title: note.title || '',
          desc: note.desc || ''
        }))
      };

      currentPromise = axiosClient.post('/event-notes', step2Payload)
        .then(response => {
          console.log(`Lưu bản nháp Step 2 thành công!`, response.data);
          return true;
        })
        .catch(error => {
          const errorMsg = error.response?.data?.message || error.response?.data || error.message;
          alert(`Không thể lưu bản nháp Step 2: ` + errorMsg);
          return false;
        });
      break;
    }

    case 3: {
      const mappedMain = (formData.mainPrizes || []).map(item => ({
        prizeName: item.name?.trim() || '',
        description: item.desc?.trim() || '',
        money: item.cash !== '' && item.cash !== undefined && item.cash !== null ? Number(item.cash) : null,
        quantity: item.quantity !== '' && item.quantity !== undefined && item.quantity !== null ? Number(item.quantity) : null,
        prizeType: 'MAIN'
      }));

      const mappedExtended = (formData.extendedPrizes || []).map(item => ({
        prizeName: item.name?.trim() || '',
        description: item.desc?.trim() || '',
        money: item.cash !== '' && item.cash !== undefined && item.cash !== null ? Number(item.cash) : null,
        quantity: item.quantity !== '' && item.quantity !== undefined && item.quantity !== null ? Number(item.quantity) : null,
        prizeType: 'EXTENDED'
      }));

      const step3Payload = {
        eventId: formData.id,
        participationBenefits: formData.benefits,
        prizes: [...mappedMain, ...mappedExtended]
      };

      currentPromise = axiosClient.post('/prize', step3Payload)
        .then(response => {
          console.log(`Lưu bản nháp Step 3 thành công!`, response.data);
          return true;
        })
        .catch(error => {
          const errorMsg = error.response?.data?.message || error.response?.data || error.message;
          alert(`Không thể lưu bản nháp Step 3: ` + errorMsg);
          return false;
        });
      break;
    }

    case 4: {
      const step4Payload = {
        eventId: formData.id,
        rounds: (formData.rounds || []).map((item, index) => ({
          roundId: (typeof item.id === 'number' || (typeof item.id === 'string' && !item.id.startsWith('round-'))) ? Number(item.id) : null,
          name: item.name?.trim() || 'Vòng thi mới',
          timeStart: item.startDate ? toLocalISOString(item.startDate) : null,
          timeEnd: item.endDate ? toLocalISOString(item.endDate) : null,
          hasPresetiontation: false,
          topTeamPass: Number(item.topTeamPass) || 0,
          ordinal_number: index + 1,
          submissionDeadline: item.submissionDeadline ? toLocalISOString(item.submissionDeadline) : null,
          position: item.format === 'offline'
            ? (typeof item.location === 'object' ? [item.location?.name || item.location?.formatted_address].filter(Boolean).join(' - ') : (item.location || ''))
            : (item.meetingLink || ''),
          locationName: item.locationName || '',
          locationDetail: typeof item.location === 'object' ? (item.location?.detail || '') : '',
          meetingLink: item.meetingLink || ''
          ,
          rubricId: item.rubricId ? Number(item.rubricId) : null,
          submissionConfig: item.submissionType === 'new'
            ? {
              title: item.name?.trim() || '',
              submissionInstructions: item.submissionGuide || '',
              openingTime: item.submissionOpen ? toLocalISOString(item.submissionOpen) : null,
              submissionDeadline: item.submissionDeadline ? toLocalISOString(item.submissionDeadline) : null,
              hasSubmission: true,
            }
            : {
              title: '',
              submissionInstructions: '',
              openingTime: null,
              submissionDeadline: null,
              hasSubmission: false,
            },
          timelines: (item.agenda || []).map(t => ({
            name: t.name?.trim() || '',
            description: t.desc?.trim() || '',
            timeStart: t.startTime ? toLocalISOString(t.startTime) : null,
            timeEnd: null,
          })),
        })),
      };

      currentPromise = axiosClient.post('/round', step4Payload)
        .then(response => {
          console.log('Lưu bản nháp Step 4 thành công!', response.data);
          const savedRounds = response.data;
          const parseBackendDate = (dateStr) => {
            if (!dateStr) return null;
            // Đổi "2026-07-03 17:00:00" thành "2026-07-03T17:00:00" rồi mới tạo đối tượng Date
            return new Date(String(dateStr).replace(' ', 'T'));
          };

          if (Array.isArray(savedRounds)) {
            const updatedRounds = (formData.rounds || []).map((original, index) => {
              const r = savedRounds[index];
              if (!r) return original;
              return {
                ...original,
                id: r.roundId,
                name: r.roundName,
                startDate: parseBackendDate(r.roundStartTime),
                endDate: parseBackendDate(r.roundEndTime),
                submissionDeadline: parseBackendDate(r.roundSubmissionDeadline),
              };
            });
            handleFormChange('rounds', updatedRounds);
          }
          return true;
        })
        .catch(error => {
          const errorMsg = error.response?.data?.message || error.response?.data || error.message;
          alert('Không thể lưu bản nháp Step 4: ' + errorMsg);
          return false;
        });
      break;
    }

    case 5: {
      const step5Payload = {
        eventId: formData.id,
        tracks: (formData.categories || []).map(item => ({
          name: item.name?.trim() || 'Bảng đấu mới',
          des: item.desc?.trim() || '',
          minTeamPerTrack: 1,
          maxTeamPerTrack: Number(item.teamLimit) || 10
        }))
      };

      currentPromise = axiosClient.post('/track', step5Payload)
        .then(response => {
          console.log(`Lưu bản nháp Step 5 thành công!`, response.data);
          const savedTracks = response.data;
          if (Array.isArray(savedTracks)) {
            const updatedCategories = savedTracks.map(t => ({
              id: t.id,
              name: t.name,
              desc: t.des,
              teamLimit: t.maxTeamPerTrack
            }));
            handleFormChange('categories', updatedCategories);
          }
          return true;
        })
        .catch(error => {
          const errorMsg = error.response?.data?.message || error.response?.data || error.message;
          alert(`Không thể lưu bản nháp Step 5: ` + errorMsg);
          return false;
        });
      break;
    }

    case 6: {
      if (!formData.id) {
        alert("Không tìm thấy thông tin sự kiện gốc!");
        return false;
      }

      const formatToLocalDateTimeOrNull = (dateVal) => {
        if (!dateVal) return null;
        const parsedDate = new Date(dateVal);
        if (isNaN(parsedDate.getTime())) return null;
        const pad = (num) => String(num).padStart(2, '0');
        return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(parsedDate.getDate())}T${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}:${pad(parsedDate.getSeconds())}`;
      };

      const autoMilestones = [];
      if (formData?.openDate) autoMilestones.push({ title: 'Mở cổng đăng ký', date: formData.openDate, endDate: null, description: 'Hệ thống tự động' });
      if (formData?.closeDate) autoMilestones.push({ title: 'Đóng đăng ký', date: formData.closeDate, endDate: null, description: 'Hệ thống tự động' });
      (formData?.rounds || []).forEach(r => {
        if (r.startDate) autoMilestones.push({ title: r.name, date: r.startDate, endDate: r.endDate || null, description: r.position || '' });
      });

      const manualMilestones = (formData?.manualMilestones || []).map(m => ({
        title: m.title || 'Mốc thủ công mới',
        date: m.date,
        endDate: m.endDate || null,
        description: m.description || ''
      }));

      const step6Payload = {
        eventId: parseInt(formData.id),
        milestones: [...autoMilestones, ...manualMilestones].map(item => ({
          name: item.title?.trim() || 'Mốc sự kiện',
          des: item.description?.trim() || '',
          timeStart: formatToLocalDateTimeOrNull(item.date),
          timeEnd: formatToLocalDateTimeOrNull(item.endDate)
        }))
      };

      currentPromise = axiosClient.post('/milestone', step6Payload)
        .then(response => {
          console.log(`Lưu bản nháp Step 6 thành công!`, response.data);
          return true;
        })
        .catch(() => {
          alert(`Không thể lưu mốc thời gian sự kiện (Step 6)`);
          return false;
        });
      break;
    }

    case 7: {
      apiEndpoint = '/mentor-judge';
      if (!formData.id) {
        alert("Không tìm thấy thông tin sự kiện gốc!");
        return false;
      }

      const step7Payload = {
        eventId: parseInt(formData.id),
        mentors: (formData.mentors || []).map(m => ({
          userId: parseInt(m.id),
          trackId: m.categoryId ? parseInt(m.categoryId) : null,
        })),
        judges: (formData.judges || []).map(j => ({
          userId: parseInt(j.id),
          trackIds: (j.categoryIds || []).map(id => parseInt(id)),
        })),
      };

      currentPromise = axiosClient.post(apiEndpoint, step7Payload)
        .then(response => {
          console.log('Lưu bản nháp Step 7 thành công!', response.data);
          return true;
        })
        .catch(error => {
          const errorMsg = error.response?.data?.message || error.response?.data || error.message;
          alert('Không thể lưu bản nháp Step 7: ' + errorMsg);
          return false;
        });
      break;
    }

    default:
      return false;
  }

  // Nếu có sinh ra một Promise mới cho step hiện tại, đưa vào hàng đợi quản lý chống trùng lặp
  if (currentPromise) {
    handleSaveDraft.activePromises[currentStep] = currentPromise.finally(() => {
      // Khi request hoàn thành (bất kể thành công hay thất bại), clear khỏi object để lần sau gọi tiếp
      handleSaveDraft.activePromises[currentStep] = null;
    });
    return handleSaveDraft.activePromises[currentStep];
  }
}