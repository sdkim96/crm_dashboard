// This file is auto-generated by @hey-api/openapi-ts

export type BizClientDTO = {
    u_id: string;
    category: string;
    blob_file_name: string;
    origin_file_name: string;
    biz_card: BusinessCard;
};

export type Body_sign_in_api_v1_users_sign_in_post = {
    grant_type?: (string | null);
    username: string;
    password: string;
    scope?: string;
    client_id?: (string | null);
    client_secret?: (string | null);
};

export type Body_upload_file_api_v1_dashboard_upload_file_post = {
    u_id: string;
    file: (Blob | File);
};

export type BusinessCard = {
    u_id?: string;
    name: string;
    role?: (string | null);
    phone_number?: (string | null);
    email?: (string | null);
    company: Company;
};

export type Company = {
    u_id?: string;
    name: string;
    address: string;
    english_name?: (string | null);
    website?: (string | null);
};

export type DeleteDashboardResponse = {
    request_id?: string;
    status: boolean;
};

export type GetBizcardsResponse = {
    request_id?: string;
    bizcards: Array<BizClientDTO>;
};

export type GetDashboardResponse = {
    request_id?: string;
    projects: Array<ProjectDTO>;
};

export type HTTPValidationError = {
    detail?: Array<ValidationError>;
};

export type PostCreateProjectRequest = {
    query: string;
    thread_id: string;
    parent_id?: (string | null);
    message_id?: (string | null);
};

export type PostCreateProjectResponse = {
    request_id?: string;
    status: boolean;
};

export type PostDashboardUploadFileResponse = {
    request_id?: string;
    status: boolean;
};

export type ProjectCategory = 'short_term' | 'mid_term' | 'long_term' | 'forever';

export type ProjectDateFilter = 'all' | 'week' | 'month';

export type ProjectDTO = {
    u_id?: string;
    title?: (string | null);
    summary?: (string | null);
    content?: (string | null);
    priority: ProjectPriority;
    category: ProjectCategory;
    start_date: number;
    end_date: number;
    file_id?: (string | null);
    file_name?: (string | null);
    original_file_name?: (string | null);
};

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export type ProjectProgress = {
    u_id?: string;
    title?: (string | null);
    priority: ProjectPriority;
    category: ProjectCategory;
    start_date: number;
    end_date: number;
    progress: number;
};

export type ProjectProgressResponse = {
    request_id?: string;
    projects: Array<ProjectProgress>;
};

export type PutModifyProjectRequest = {
    u_id: string;
    title: string;
    summary: string;
    content: (string | null);
    priority: ProjectPriority;
    category: ProjectCategory;
    start_date: number;
    end_date: number;
};

export type PutModifyProjectResponse = {
    request_id?: string;
    status: boolean;
};

export type Token = {
    access_token: string;
    token_type?: string;
};

export type UserCreate = {
    name: string;
    password: string;
    user_name?: string;
    user_nickname?: string;
};

export type UserDTO = {
    u_id?: string;
    name?: string;
    user_name?: string;
    user_nickname?: string;
    user_type?: UType;
};

export type UType = 'staff' | 'manager' | 'director' | 'admin';

export type ValidationError = {
    loc: Array<(string | number)>;
    msg: string;
    type: string;
};

export type SignUpApiV1UsersSignUpPostData = {
    requestBody: UserCreate;
};

export type SignUpApiV1UsersSignUpPostResponse = (UserDTO);

export type SignInApiV1UsersSignInPostData = {
    formData: Body_sign_in_api_v1_users_sign_in_post;
};

export type SignInApiV1UsersSignInPostResponse = (Token);

export type GetMeApiV1UsersMeGetResponse = (UserDTO);

export type GetDashboardApiV1DashboardGetData = {
    category?: (ProjectCategory | null);
    dateFilter?: (ProjectDateFilter | null);
    limit?: number;
    offset?: number;
    priority?: (ProjectPriority | null);
    query?: (string | null);
};

export type GetDashboardApiV1DashboardGetResponse = (GetDashboardResponse);

export type GetProjectProgressApiV1DashboardProgressGetResponse = (ProjectProgressResponse);

export type CreateProjectApiV1DashboardCreatePostData = {
    requestBody: PostCreateProjectRequest;
};

export type CreateProjectApiV1DashboardCreatePostResponse = (PostCreateProjectResponse);

export type ModifyProjectApiV1DashboardModifyPutData = {
    requestBody: PutModifyProjectRequest;
};

export type ModifyProjectApiV1DashboardModifyPutResponse = (PutModifyProjectResponse);

export type DeleteProjectApiV1DashboardDeleteDeleteData = {
    uId: string;
};

export type DeleteProjectApiV1DashboardDeleteDeleteResponse = (DeleteDashboardResponse);

export type UploadFileApiV1DashboardUploadFilePostData = {
    formData: Body_upload_file_api_v1_dashboard_upload_file_post;
};

export type UploadFileApiV1DashboardUploadFilePostResponse = (PostDashboardUploadFileResponse);

export type DownloadFileApiV1DashboardDownloadFileGetData = {
    uId: string;
};

export type DownloadFileApiV1DashboardDownloadFileGetResponse = ((Blob | File));

export type DeleteFileApiV1DashboardDeleteFileDeleteData = {
    uId: string;
};

export type DeleteFileApiV1DashboardDeleteFileDeleteResponse = (DeleteDashboardResponse);

export type GetBizcardsApiV1BizGetResponse = (GetBizcardsResponse);