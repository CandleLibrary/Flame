import { ActionType } from "./action_type";

export interface HistoryArtifact {
    type: ActionType;
    progress?: {
        comp_data_name: string;
        ele_index: number,
        valueA?: string | number;
        valueB?: string | number;
        valueC?: string | number;
        valueD?: string | number;
        pos?: any;
    };
    regress?: {
        comp_data_name: string;
        ele_index: number,
        valueA?: string | number;
        valueB?: string | number;
        valueC?: string | number;
        valueD?: string | number;
        pos?: any;
    };
}
