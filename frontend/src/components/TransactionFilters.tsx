import { useState } from "react";

type FiltersProps = {
    onFilterChange: (filters: FiltersState) => void;
};

export type FiltersState = {
    name: string;
    createdBy: string;
    suspicious: string;
    promotionId: string;
    type: string;
    relatedId: string;
    amount: string;
    operator: string;
};

const TransactionFilters: React.FC<FiltersProps> = ({ onFilterChange }) => {
    const [filters, setFilters] = useState<FiltersState>({
        name: "",
        createdBy: "",
        suspicious: "",
        promotionId: "",
        type: "",
        relatedId: "",
        amount: "",
        operator: "gte",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="p-3">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="grid grid-cols-1 gap-3">
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={filters.name}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                />
                <input
                    type="text"
                    name="createdBy"
                    placeholder="Created By"
                    value={filters.createdBy}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                />
                <select
                    name="suspicious"
                    value={filters.suspicious}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                >
                    <option value="">Suspicious</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
                <input
                    type="number"
                    name="promotionId"
                    placeholder="Promotion ID"
                    value={filters.promotionId}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                />
                {/*<input*/}
                {/*    type="text"*/}
                {/*    name="type"*/}
                {/*    placeholder="Type"*/}
                {/*    value={filters.type}*/}
                {/*    onChange={handleChange}*/}
                {/*    className="p-2 border rounded w-full"*/}
                {/*/>*/}
                <select
                    name="type"
                    value={filters.type}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                >
                    <option value="">Type</option>
                    <option value="purchase">Purchase</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="event">Event</option>
                    <option value="transfer">Transfer</option>
                    <option value="redemption">Redemption</option>
                </select>
                <input
                    type="number"
                    name="relatedId"
                    placeholder="Related ID"
                    value={filters.relatedId}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                />
                <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={filters.amount}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                />
                <select
                    name="operator"
                    value={filters.operator}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                >
                    <option value="gte">Greater than or equal</option>
                    <option value="lte">Less than or equal</option>
                </select>
            </div>
            <button
                onClick={() => onFilterChange(filters)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
            >
                Apply Filters
            </button>
        </div>
    );
};

export default TransactionFilters;