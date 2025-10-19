import { useEffect, useState, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Paper,
	TablePagination,
	TextField,
	Button,
	CircularProgress,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TableHead,
	TableSortLabel,
	MenuItem,
	Select,
	FormControl,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import axiosClient from "../api/axiosClient";
import ConfirmDialog from "../components/ConfirmDialog";
import { debounce } from "lodash";

interface Expense {
	id: number;
	title: string;
	category: string;
	amount: number;
	date: string;
	description?: string;
}

interface ApiResponse<T> {
	statusCode: number;
	message: string;
	data: T;
}

interface PagedResponse<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	size: number;
	number: number;
}

const columns = [
	{ id: "title", label: "Title" },
	{ id: "category", label: "Category" },
	{ id: "amount", label: "Amount" },
	{ id: "date", label: "Date" },
];

const operatorOptions = ["==", "!=", ">", "<", ">=", "<=", "=ilike=", "=like="];

const ExpensesPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [page, setPage] = useState(Number(searchParams.get("page") || 0));
	const [size, setSize] = useState(Number(searchParams.get("size") || 5));
	const [sort, setSort] = useState(searchParams.get("sort") || "");
	const [filter, setFilter] = useState(searchParams.get("filter") || "");
	const [totalElements, setTotalElements] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [loading, setLoading] = useState(false);
	const [openDialog, setOpenDialog] = useState(false);
	const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
	const [form, setForm] = useState({
		title: "",
		category: "",
		amount: "",
		date: "",
		description: "",
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
	const [columnFilters, setColumnFilters] = useState<
		Record<string, { operator: string; value: string }>
	>(
		Object.fromEntries(columns.map((col) => [col.id, { operator: "==", value: "" }]))
	);

	const fetchExpenses = () => {
		setLoading(true);
		const params = { page, size, sort: sort || undefined, filter: filter.trim() || undefined };

		axiosClient
			.get<ApiResponse<PagedResponse<Expense>>>("/api/expense-tracker/expenses", {
				params,
				withCredentials: true,
			})
			.then((res) => {
				const data = res.data.data;
				setExpenses(data.content);
				setTotalElements(data.totalElements);
				setTotalPages(data.totalPages);
			})
			.catch((err) => console.error("Error fetching expenses:", err))
			.finally(() => setLoading(false));
	};

	// Sync URL with state whenever page, size, sort, filter change
	useEffect(() => {
		const params: Record<string, string> = {};
		if (page) params.page = page.toString();
		if (size) params.size = size.toString();
		if (sort) params.sort = sort;
		if (filter) params.filter = filter;
		setSearchParams(params);
		fetchExpenses();
	}, [page, size, sort, filter]);

	const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);

	const handleRowsPerPageChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSize(parseInt(e.target.value, 10));
		setPage(0);
	};

	const debouncedFilterUpdate = debounce(
		(updatedFilters: Record<string, { operator: string; value: string }>) => {
			const combined = Object.entries(updatedFilters)
				.filter(([, { value }]) => value.trim() !== "")
				.map(([key, { operator, value }]) => {
					const safeValue = value.replace(/'/g, "\\'");
					if (operator.includes("like")) {
						return `${key}${operator}'%${safeValue}%'`;
					}
					return `${key}${operator}'${safeValue}'`;
				})
				.join(";");

			setFilter(combined);
			setPage(0);
		},
		500
	);

	const handleColumnFilterChange = (colId: string, field: "operator" | "value", newValue: string) => {
		setColumnFilters((prev) => {
			const updated = {
				...prev,
				[colId]: { ...prev[colId], [field]: newValue },
			};
			debouncedFilterUpdate(updated);
			return updated;
		});
	};

	const handleSort = (column: string) => {
		setPage(0);
		setSort((prevSort) => {
			if (!prevSort.startsWith(column)) return `${column},asc`;
			if (prevSort === `${column},asc`) return `${column},desc`;
			return "";
		});
	};

	const getSortDirection = (column: string): "asc" | "desc" | undefined => {
		if (sort.startsWith(column)) {
			if (sort.endsWith(",asc")) return "asc";
			if (sort.endsWith(",desc")) return "desc";
		}
		return undefined;
	};

	const handleOpenDialog = (expense?: Expense) => {
		if (expense) {
			setEditingExpense(expense);
			setForm({
				title: expense.title,
				category: expense.category,
				amount: expense.amount.toString(),
				date: expense.date.split("T")[0],
				description: expense.description || "",
			});
		} else {
			setEditingExpense(null);
			setForm({ title: "", category: "", amount: "", date: "", description: "" });
		}
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingExpense(null);
	};

	const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSaveExpense = () => {
		const payload = {
			title: form.title.trim(),
			category: form.category.trim(),
			amount: parseFloat(form.amount),
			date: new Date(form.date).toISOString(),
			description: form.description.trim(),
		};

		const apiCall = editingExpense
			? axiosClient.put(`/api/expense-tracker/expenses/${editingExpense.id}`, payload, {
				withCredentials: true,
			})
			: axiosClient.post("/api/expense-tracker/expenses", payload, {
				withCredentials: true,
			});

		apiCall
			.then(() => {
				fetchExpenses();
				handleCloseDialog();
			})
			.catch((err) => console.error("Error saving expense:", err));
	};

	const handleOpenDeleteDialog = (id: number) => {
		setSelectedExpenseId(id);
		setDeleteDialogOpen(true);
	};

	const handleCloseDeleteDialog = () => {
		setSelectedExpenseId(null);
		setDeleteDialogOpen(false);
	};

	const handleConfirmDelete = () => {
		if (!selectedExpenseId) return;

		axiosClient
			.delete(`/api/expense-tracker/expenses/${selectedExpenseId}`, { withCredentials: true })
			.then(() => fetchExpenses())
			.catch((err) => console.error("Error deleting expense:", err))
			.finally(() => handleCloseDeleteDialog());
	};

	return (
		<Box>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
				<Typography variant="h5">Expenses</Typography>
				<Button
					variant="contained"
					color="primary"
					startIcon={<Add />}
					onClick={() => handleOpenDialog()}
				>
					Add Expense
				</Button>
			</Box>

			{loading ? (
				<Box display="flex" justifyContent="center" alignItems="center" mt={4}>
					<CircularProgress />
				</Box>
			) : (
				<Paper>
					<TableContainer>
						<Table
							sx={{
								border: "1px solid #ddd",
								"& th, & td": { border: "1px solid #ddd" },
								"& thead th": {
									backgroundColor: "#f5f5f5",
									fontWeight: "bold",
									textTransform: "uppercase",
									fontSize: "0.9rem",
								},
							}}
						>
							<TableHead>
								<TableRow>
									{columns.map((col) => (
										<TableCell
											key={col.id}
											sortDirection={getSortDirection(col.id)}
											sx={{ borderBottom: "2px solid #ccc", backgroundColor: "#f5f5f5" }}
										>
											<TableSortLabel
												active={sort.startsWith(col.id)}
												direction={getSortDirection(col.id) || "asc"}
												onClick={() => handleSort(col.id)}
											>
												<strong>{col.label}</strong>
											</TableSortLabel>
										</TableCell>
									))}
									<TableCell sx={{ borderBottom: "2px solid #ccc", backgroundColor: "#f5f5f5" }}>
										<strong>Actions</strong>
									</TableCell>
								</TableRow>

								<TableRow>
									{columns.map((col) => (
										<TableCell
											key={`${col.id}-filter`}
											sx={{ width: "20%", padding: "4px 6px", backgroundColor: "#fafafa" }}
										>
											<Box display="flex" alignItems="center" gap={0.5}>
												<FormControl size="small" sx={{ minWidth: 50, width: "28%" }}>
													<Select
														value={columnFilters[col.id].operator}
														onChange={(e) =>
															handleColumnFilterChange(col.id, "operator", e.target.value)
														}
														sx={{ height: 30, fontSize: "0.75rem" }}
														>
														{operatorOptions.map((op) => (
															<MenuItem key={op} value={op}>
																{op}
															</MenuItem>
														))}
													</Select>
												</FormControl>

												<TextField
													size="small"
													value={columnFilters[col.id].value}
													onChange={(e) =>
														handleColumnFilterChange(col.id, "value", e.target.value)
													}
													placeholder="..."
													fullWidth
													sx={{
														width: "72%",
														"& .MuiInputBase-input": { height: 22, padding: "4px 6px", fontSize: "0.8rem" },
													}}
												/>
											</Box>
										</TableCell>
									))}
									<TableCell sx={{ width: "10%", backgroundColor: "#fafafa" }} />
								</TableRow>
							</TableHead>

							<TableBody>
								{expenses.length > 0 ? (
									expenses.map((exp) => (
										<TableRow key={exp.id}>
											<TableCell>{exp.title}</TableCell>
											<TableCell>{exp.category}</TableCell>
											<TableCell>₹{exp.amount.toFixed(2)}</TableCell>
											<TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
											<TableCell>
												<IconButton color="primary" onClick={() => handleOpenDialog(exp)}>
													<Edit />
												</IconButton>
												<IconButton color="error" onClick={() => handleOpenDeleteDialog(exp.id)}>
													<Delete />
												</IconButton>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={5} align="center">
											No expenses found
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>

					<TablePagination
						component="div"
						count={totalElements}
						page={page}
						onPageChange={handlePageChange}
						rowsPerPage={size}
						onRowsPerPageChange={handleRowsPerPageChange}
						rowsPerPageOptions={[2, 3, 5, 7, 11, 13, 17, 19]}
						labelDisplayedRows={({ page }) => `Page: ${page + 1} of ${totalPages}`}
					/>
				</Paper>
			)}

			<Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
				<DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
				<DialogContent>
					<Box display="flex" flexDirection="column" gap={2} mt={1}>
						<TextField label="Title" name="title" value={form.title} onChange={handleFormChange} fullWidth />
						<TextField label="Category" name="category" value={form.category} onChange={handleFormChange} fullWidth />
						<TextField label="Amount" name="amount" value={form.amount} onChange={handleFormChange} fullWidth type="number" />
						<TextField label="Date" name="date" value={form.date} onChange={handleFormChange} fullWidth type="date" />
						<TextField label="Description" name="description" value={form.description} onChange={handleFormChange} fullWidth multiline minRows={2} />
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Cancel</Button>
					<Button variant="contained" color="primary" onClick={handleSaveExpense}>
						{editingExpense ? "Update" : "Create"}
					</Button>
				</DialogActions>
			</Dialog>

			<ConfirmDialog
				open={deleteDialogOpen}
				title="Delete Expense"
				message="Are you sure you want to delete this expense? This action cannot be undone."
				onConfirm={handleConfirmDelete}
				onCancel={handleCloseDeleteDialog}
			/>
		</Box>
	);
};

export default ExpensesPage;
