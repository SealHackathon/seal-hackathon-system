import { useState, useEffect, useRef } from 'react'
import { Trash } from '@phosphor-icons/react'
import FormInput from '../../../shared/FormInput'
import FormTextarea from '../../../shared/FormTextarea'
import styles from './CriterionCard.module.css'

function CriterionCard({ criterion, isActive, onClick, onUpdate, onDelete }) {
  const cardRef = useRef(null);
  const [localWeight, setLocalWeight] = useState(criterion.weight?.toString() || '');
  const [error, setError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);

  useEffect(() => {
    setLocalWeight(criterion.weight?.toString() || '');
  }, [criterion.weight]);

  useEffect(() => {
    if (isActive && cardRef.current) {
      // Chờ Framer Motion hoàn thành animation một chút rồi mới scroll
      const timer = setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isActive, criterion.weight]); // Nếu đang active mà đổi weight (bị sort) thì cũng tự động bám theo

  const isCriterionNameValid = criterion.name?.trim() !== '';

  const handleWeightBlur = () => {
    const val = localWeight.trim();
    if (!val) {
      setError('Vui lòng nhập số');
      onUpdate('error', true);
      return;
    }

    // Kiểm tra có phải là số không (không chứa chữ/ký tự đặc biệt ngoại trừ dấu -)
    if (!/^-?\d+$/.test(val) && !/^-?\d*\.\d+$/.test(val)) {
      setError('Chỉ nhập số');
      onUpdate('error', true);
      return;
    }

    const num = parseFloat(val);
    if (num < 0) {
      setError('Không nhập số âm');
      onUpdate('error', true);
      return;
    }
    if (num > 100) {
      setError('Không quá 100');
      onUpdate('error', true);
      return;
    }

    setError('');
    onUpdate('error', false);
    onUpdate('weight', num);
  };

  const handleWeightChange = (e) => {
    const val = e.target.value;
    setLocalWeight(val);
    
    // Nếu đang có lỗi thì xóa lỗi khi người dùng bắt đầu nhập lại
    if (error) {
      setError('');
      onUpdate('error', false);
    }

    // Luôn cập nhật giá trị thô lên parent để hiệu ứng auto sort hoạt động ngay lập tức.
    // Các giá trị không hợp lệ (như chữ, rỗng) sẽ được parent quy về 0 khi tính toán vị trí,
    // và lỗi chỉ thực sự được báo khi onBlur.
    onUpdate('weight', val);
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
    >
      <div className={styles.nameContainer}>
        <FormInput
          required={true}
          type="text"
          placeholder="VD: Tính khả thi..."
          value={criterion.name}
          onChange={(e) => onUpdate('name', e.target.value)}
          onBlur={() => setNameTouched(true)}
          status={(!isCriterionNameValid && nameTouched) ? 'error' : ''}
          message={(!isCriterionNameValid && nameTouched) ? 'Tên tiêu chí không được để trống' : ''}
        />
      </div>

      <div className={styles.descContainer}>
        <FormTextarea
          required={false}
          type="text"
          placeholder="Mô tả tiêu chí..."
          value={criterion.description}
          onChange={(e) => onUpdate('description', e.target.value)}
        />
      </div>
      
      <div className={styles.weightContainer}>
        <div className={styles.weightBox}>
          <FormInput
            required={true}
            type="text"
            value={localWeight}
            onChange={handleWeightChange}
            onBlur={handleWeightBlur}
            status={error ? 'error' : ''}
            message={error}
          />
          <span className={`${styles.percentSign} ${error ? styles.percentSignError : ''}`}>%</span>
        </div>
      </div>

      <button
        className={styles.deleteBtn}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Xóa tiêu chí"
      >
        <Trash size={20} weight="fill" />
      </button>
    </div>
  )
}

export default CriterionCard
