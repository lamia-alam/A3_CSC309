import {useContext, useState} from "react";
import {AuthContext} from "../context/AuthContext.tsx";

type FiltersProps = {
    onFilterChange: (filters: FiltersState) => void;
};

export type FiltersState = {
    name: string;
    type: string;
    started: boolean;
    ended: boolean;
};

const PromotionFilters: React.FC<FiltersProps> = ({ onFilterChange }) => {
    const {role} = useContext(AuthContext)
    const [filters, setFilters] = useState<FiltersState>({
        name: "",
        type: "",
        started: false,
        ended: false,
    });
    const inPower = role !== null && ["superuser", "manager"].includes(role)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (["started", "ended"].includes(name)) {
            if (name === "started") {
                setFilters({...filters, started: !filters.started})
            } else {
                setFilters({...filters, ended: !filters.ended})
            }
        } else {
            setFilters((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    return (
        <div className="p-3 flex gap-3 mb-4 items-center">
            <h2 className="text-lg font-semibold">Filters</h2>
            <input
                type="text"
                name="name"
                placeholder="Name"
                value={filters.name}
                onChange={handleChange}
                className="p-2 border rounded w-full h-10"
            />
            <select
                name="type"
                value={filters.type}
                onChange={handleChange}
                className="p-2 border rounded w-full h-10"
            >
                <option value="">Type</option>
                <option value="one-time">One-Time</option>
                <option value="automatic">Automatic</option>
            </select>
            {inPower &&
                <div className={"flex-col flex"}>
                    <div className={"flex-row flex gap-1"}>
                        <input
                            type="checkbox"
                            name="started"
                            value={"true"}
                            disabled={filters.ended}
                            checked={filters.started}
                            onChange={handleChange}
                        /><h3>Started</h3>
                    </div>
                    <div className={"flex-row flex gap-1"}>
                        <input
                            type="checkbox"
                            name="ended"
                            value={"true"}
                            disabled={filters.started}
                            checked={filters.ended}
                            onChange={handleChange}
                        />
                        <h3>Ended</h3>
                    </div>
                    </div>
                    }
                    <button
                        onClick={() => onFilterChange(filters)}
                        className="bg-primary text-white rounded w-full hover:bg-secondary btn-sm h-10"
                    >
                        Apply Filters
                    </button>
                </div>
                );
            };

            export default PromotionFilters;