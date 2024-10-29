import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DataTablePaginationProps = {
	className?: string
	limits?: number[]
	page: number
	limit: number
	hasNext: boolean
	prev: () => void
	next: () => void
	setLimit: (limit: number) => void
}

export const DataTablePagination = ({
	                                    className,
	                                    limits,
	                                    page,
	                                    limit,
	                                    hasNext,
	                                    prev,
	                                    next,
	                                    setLimit,
                                    }: DataTablePaginationProps) => {
	const defLimits = [5, 10, 20, 50, 100]
	return (
		<Pagination className={className}>
			<PaginationContent>
				<Select value={String(limit)} onValueChange={value => setLimit(Number(value))}>
					<SelectTrigger className="w-20">
						<SelectValue placeholder=""/>
					</SelectTrigger>
					<SelectContent>
						{(limits ?? defLimits).map(limit => (
							<SelectItem key={limit} value={String(limit)}>
								{limit}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<PaginationItem>
					<PaginationPrevious onClick={prev}/>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink isActive>{page + 1}</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationNext onClick={() => {
						if (hasNext) next()
					}}/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	)
}