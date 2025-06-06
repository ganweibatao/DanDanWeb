import React from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null; 
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={styles.paginationContainer}>
      <button onClick={handlePrevious} disabled={currentPage === 1} className={styles.pageButton}>
        上一页
      </button>
      <span className={styles.pageInfo}>
        第 {currentPage} 页 / 共 {totalPages} 页
      </span>
      <button onClick={handleNext} disabled={currentPage === totalPages} className={styles.pageButton}>
        下一页
      </button>
    </div>
  );
};

export default Pagination; 