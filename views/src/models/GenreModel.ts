export interface Genre {
    id: string;
    name: string;
    isActive: boolean;
    lastEdited: Date;
}

export interface genreCreateUpdate {
    name: string;
}