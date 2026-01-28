// src/components/ui/Pagination/Pagination.jsx
import React from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import styles from './Pagination.module.css'

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  showInfo = true,
  className = ''
}) {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5

  // Calculate page range
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let endPage = Math.min(totalPages, startPage + maxVisible - 1)

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={`${styles.pagination} ${className}`}>
      {showInfo && totalItems > 0 && (
        <div className={styles.info}>
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
      )}
      
      <div className={styles.controls}>
        <button
          className={`${styles.button} ${styles.prev}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <FaChevronLeft />
        </button>

        {startPage > 1 && (
          <>
            <button
              className={`${styles.button} ${styles.page}`}
              onClick={() => handlePageChange(1)}
            >
              1
            </button>
            {startPage > 2 && <span className={styles.ellipsis}>...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            className={`${styles.button} ${styles.page} ${
              page === currentPage ? styles.active : ''
            }`}
            onClick={() => handlePageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
            <button
              className={`${styles.button} ${styles.page}`}
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className={`${styles.button} ${styles.next}`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  )
}

