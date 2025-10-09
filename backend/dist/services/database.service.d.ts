export interface CanvasData {
    id?: number;
    name: string;
    canvas_data?: any;
    created_at?: string;
    updated_at?: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}
export interface UserData {
    id?: number;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone?: string;
    roles: string[];
    status: 'Active' | 'Inactive';
    hiredDate?: string;
    lastLogin?: string | null;
    created_at?: string;
    updated_at?: string;
}
export declare class DatabaseService {
    static parseRoles(raw: any): string[];
    static saveCanvas(canvasData: any, name: string): Promise<ApiResponse<CanvasData>>;
    static getCanvasList(): Promise<ApiResponse<CanvasData[]>>;
    static getCanvas(id: string): Promise<ApiResponse<CanvasData>>;
    static updateCanvas(id: string, canvasData: any, name?: string): Promise<ApiResponse<CanvasData>>;
    static deleteCanvas(id: string): Promise<ApiResponse>;
    static healthCheck(): Promise<ApiResponse>;
    static getUsers(role?: string, status?: string): Promise<ApiResponse<UserData[]>>;
    static getUser(id: string): Promise<ApiResponse<UserData>>;
    static createUser(userData: Omit<UserData, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<UserData>>;
    static updateUser(id: string, userData: Partial<Omit<UserData, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<UserData>>;
    static deleteUser(id: string): Promise<ApiResponse>;
    static updateUserLastLogin(id: string): Promise<ApiResponse>;
}
//# sourceMappingURL=database.service.d.ts.map