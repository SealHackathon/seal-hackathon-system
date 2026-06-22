export function handleSaveDraft({ currentStep, formData, axiosClient, handleFormChange }) {
  console.log(`Bắt đầu lưu nháp cho Step ${currentStep}`);

  const sendData = new FormData();

  if (formData.id) {
    sendData.append('id', formData.id);
  }

  let apiEndpoint = '/event';

  switch (currentStep) {
    case 1: {
      sendData.append('name', formData.name || '');
      sendData.append('descriptionDetails', formData.detailDesc || '');
      sendData.append('topic', formData.theme || '');
      sendData.append('description', formData.shortDesc || '');
      sendData.append('minTeamMember', formData.minMembers || 1);
      sendData.append('maxTeamMember', formData.maxMembers || 5);

      if (formData.openDate) sendData.append('openRegisterTime', new Date(formData.openDate).toISOString());
      if (formData.closeDate) sendData.append('closeRegisterTime', new Date(formData.closeDate).toISOString());
      if (formData.teamDeadline) sendData.append('cofirmTeamTime', new Date(formData.teamDeadline).toISOString());

      if (formData.avatarFile) sendData.append('bannerFile', formData.avatarFile);
      if (formData.coverFile) sendData.append('thumbnailFile', formData.coverFile);

      return axiosClient.post(apiEndpoint, sendData)
        .then(response => {
          console.log(`Lưu bản nháp Step ${currentStep} thành công!`, response.data);
          if (response.data && response.data.id) {
            handleFormChange('id', response.data.id);
          }
          return true;
        })
        .catch(error => {
          const errorMsg = error.response?.data?.message || error.response?.data || error.message;
          alert(`Không thể lưu bản nháp Step ${currentStep}: ` + errorMsg);
          return false;
        });
    }

    case 2: {
      const step2Payload = {
        eventId: formData.id,
        eventRules: formData.generalRules || '',
        notes: formData.notes || []
      };

      return axiosClient.post('/event-notes', step2Payload)
        .then(response => {
          console.log(`Lưu bản nháp Step 2 thành công!`, response.data);
          return true;
        })
        .catch(error => {
          const errorMsg = error.response?.data?.message || error.response?.data || error.message;
          alert(`Không thể lưu bản nháp Step 2: ` + errorMsg);
          return false;
        });
    }

    case 3: {
      const mappedMain = (formData.mainPrizes || []).map(item => ({
        prizeName: item.name?.trim() || item.defaultName || 'Giải thưởng',
        description: item.desc?.trim() || '',
        money: Number(item.cash) || 0,
        quantity: Number(item.quantity) || 1,
        prizeType: 'MAIN'
      }));

      const mappedExtended = (formData.extendedPrizes || []).map(item => ({
        prizeName: item.name?.trim() || 'Giải phụ',
        description: item.desc?.trim() || '',
        money: Number(item.cash) || 0,
        quantity: Number(item.quantity) || 1,
        prizeType: 'EXTENDED'
      }));

      const step3Payload = {
        eventId: formData.id,
        participationBenefits: formData.benefits,
        prizes: [...mappedMain, ...mappedExtended]
      };

      return axiosClient.post('/prize', step3Payload)
        .then(response => {
          console.log(`Lưu bản nháp Step 3 thành công!`, response.data);
          return true;
        })
        .catch(error => {
          const errorMsg = error.response?.data?.message || error.response?.data || error.message;
          alert(`Không thể lưu bản nháp Step 3: ` + errorMsg);
          return false;
        });
    }

    case 4: {
      const step4Payload = {
        eventId: formData.id,
        rounds: (formData.rounds || []).map((item, index) => ({
          name: item.name?.trim() || 'Vòng thi mới',
          timeStart: item.startDate ? new Date(item.startDate).toISOString() : null,
          timeEnd: item.endDate ? new Date(item.endDate).toISOString() : null,
          hasPresetiontation: false,
          topTeamPass: Number(item.topTeamPass) || 0,
          ordinal_number: index + 1,
          submissionDeadline: item.submissionDeadline ? new Date(item.submissionDeadline).toISOString() : null,
          position: item.format === 'offline'
            ? (item.location?.name || item.location?.formatted_address || '')
            : (item.meetingLink || ''),
          rubricId: Number(item.rubricId) || 0,
          submissionConfig: item.submissionType === 'new'
            ? {
                title: item.name?.trim() || '',
                submissionInstructions: item.submissionGuide || '',
                openingTime: item.submissionOpen ? new Date(item.submissionOpen).toISOString() : null,
                submissionDeadline: item.submissionDeadline ? new Date(item.submissionDeadline).toISOString() : null,
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
            timeStart: t.startTime || null,
            timeEnd: null,
          })),
        })),
      };

      return axiosClient.post('/round', step4Payload)
        .then(response => {
          console.log('Lưu bản nháp Step 4 thành công!', response.data);
          return true;
        })
        .catch(error => {
          const errorMsg = error.response?.data?.message || error.response?.data || error.message;
          alert('Không thể lưu bản nháp Step 4: ' + errorMsg);
          return false;
        });
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

      return axiosClient.post('/track', step5Payload)
        .then(response => {
          console.log(`Lưu bản nháp Step 5 thành công!`, response.data);
          return true;
        })
        .catch(error => {
          const errorMsg = error.response?.data?.message || error.response?.data || error.message;
          alert(`Không thể lưu bản nháp Step 5: ` + errorMsg);
          return false;
        });
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

      return axiosClient.post('/milestone', step6Payload)
        .then(response => {
          console.log(`Lưu bản nháp Step 6 thành công!`, response.data);
          return true;
        })
        .catch(error => {
          alert(`Không thể lưu mốc thời gian sự kiện (Step 6)`);
          return false;
        });
    }

    default:
      break;
  }
}