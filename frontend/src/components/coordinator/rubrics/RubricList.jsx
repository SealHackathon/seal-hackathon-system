import RubricCard from './RubricCard';
import EmptyRubricState from './EmptyRubricState';
import styles from './RubricList.module.css';

export default function RubricList({ rubrics, searchQuery, onDelete, onDuplicate, onEdit }) {
    if (!rubrics || rubrics.length === 0) {
        return <EmptyRubricState searchQuery={searchQuery} />;
    }

    return (
        <div className={styles.list}>
            {rubrics.map((rubric) => (
                <RubricCard 
                    key={rubric.id} 
                    rubric={rubric} 
                    onDelete={onDelete} 
                    onDuplicate={onDuplicate}
                    onEdit={onEdit}
                />
            ))}
        </div>
    );
}
