import React from "react"
import {
  ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showFirstLastButtons?: boolean
  maxVisiblePages?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLastButtons = true,
  maxVisiblePages = 5,
}: PaginationProps) {
  // 如果总页数小于2，不显示分页
  if (totalPages <= 1) return null

  // 计算可见页数的范围
  const getVisiblePages = () => {
    const halfVisible = Math.floor(maxVisiblePages / 2)
    let startPage = Math.max(currentPage - halfVisible, 1)
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages)

    // 如果尾部不足，则增加头部
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1)
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    )
  }

  const visiblePages = getVisiblePages()

  // 处理页面更改
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  return (
    <nav
      className={cn("flex items-center justify-center space-x-1", className)}
      aria-label="分页导航"
    >
      {/* 首页按钮 */}
      {showFirstLastButtons && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          aria-label="第一页"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}

      {/* 上一页按钮 */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="上一页"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* 页码按钮 */}
      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          className={cn(
            "h-8 w-8",
            page === currentPage && "bg-primary text-primary-foreground"
          )}
          onClick={() => handlePageChange(page)}
          aria-label={`第${page}页`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Button>
      ))}

      {/* 下一页按钮 */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="下一页"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* 末页按钮 */}
      {showFirstLastButtons && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="最后一页"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  )
}

export default Pagination 