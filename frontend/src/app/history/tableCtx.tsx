'use client';

import { createContext } from "react";

interface TablePaginationContextInterface {
    pageIdx: number,
    setPageIdx: React.Dispatch<React.SetStateAction<number>>
}
export const TablePaginationContext = createContext<TablePaginationContextInterface | undefined>(undefined);