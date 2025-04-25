-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types for status and task types
create type task_status as enum ('To Do', 'On Hold', 'Canceled', 'In Progress', 'Done');
create type task_type as enum ('Lighting', 'Layout', 'Animation', 'Rigging', 'Compositing', 'Model', 'Texture', 'FX', 'Bidding');
create type review_status as enum ('Reviewed', 'Ready for Review', 'Discarded', 'Approved');
create type take_status as enum ('Needs Revisions', 'Needs Review', 'Reviewed', 'Approved');
create type user_role as enum ('admin', 'super_user', 'user');

-- Add role column to auth.users
alter table auth.users add column if not exists role user_role default 'user';

-- Set super user role for specific user
update auth.users 
set role = 'super_user' 
where id = 'a06cbc2e-d9c1-482d-bb44-fd0359611174';

-- Create tables
create table projects (
    id uuid primary key default uuid_generate_v4(),
    long_name text not null,
    short_name text not null,
    thumb text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    added_by uuid references auth.users(id),
    modified_by uuid references auth.users(id)
);

-- Junction table for project owners
create table project_owners (
    project_id uuid references projects(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    primary key (project_id, user_id)
);

-- Junction table for project crew
create table project_crew (
    project_id uuid references projects(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    primary key (project_id, user_id)
);

create table sequences (
    id uuid primary key default uuid_generate_v4(),
    long_name text not null,
    short_name text not null,
    thumb text,
    project_id uuid references projects(id) on delete cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    added_by uuid references auth.users(id),
    modified_by uuid references auth.users(id)
);

create table shots (
    id uuid primary key default uuid_generate_v4(),
    long_name text not null,
    short_name text not null,
    thumb text,
    status task_status default 'To Do',
    due_date date default current_date,
    project_id uuid references projects(id) on delete cascade,
    sequence_id uuid references sequences(id) on delete cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    added_by uuid references auth.users(id),
    modified_by uuid references auth.users(id)
);

create table assets (
    id uuid primary key default uuid_generate_v4(),
    long_name text not null,
    short_name text not null,
    thumb text,
    status task_status default 'To Do',
    due_date date default current_date,
    asset_type text default 'Default',
    project_id uuid references projects(id) on delete cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    added_by uuid references auth.users(id),
    modified_by uuid references auth.users(id)
);

create table tasks (
    id uuid primary key default uuid_generate_v4(),
    status task_status default 'To Do',
    task_type task_type default 'Bidding',
    start_date date default current_date,
    due_date date default current_date,
    assignee uuid references auth.users(id),
    shot_id uuid references shots(id) on delete cascade,
    asset_id uuid references assets(id) on delete cascade,
    workon_name text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    added_by uuid references auth.users(id),
    modified_by uuid references auth.users(id),
    constraint task_workon_check check (
        (shot_id is not null and asset_id is null) or
        (shot_id is null and asset_id is not null)
    )
);

create table takes (
    id uuid primary key default uuid_generate_v4(),
    take_number integer default 0,
    media text,
    status take_status default 'Needs Review',
    task_id uuid references tasks(id) on delete cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    added_by uuid references auth.users(id),
    modified_by uuid references auth.users(id)
);

create table reviews (
    id uuid primary key default uuid_generate_v4(),
    status review_status default 'Ready for Review',
    task_id uuid references tasks(id) on delete cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    added_by uuid references auth.users(id),
    modified_by uuid references auth.users(id)
);

-- Junction table for review CC list
create table review_cc (
    review_id uuid references reviews(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    primary key (review_id, user_id)
);

create table notes (
    id uuid primary key default uuid_generate_v4(),
    message text not null,
    review_id uuid references reviews(id) on delete cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    added_by uuid references auth.users(id),
    modified_by uuid references auth.users(id)
);

-- Junction table for note likes
create table note_likes (
    note_id uuid references notes(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    primary key (note_id, user_id)
);

create table posts (
    id uuid primary key default uuid_generate_v4(),
    content jsonb not null,
    project_id uuid references projects(id) on delete cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    added_by uuid references auth.users(id),
    modified_by uuid references auth.users(id)
);

-- Junction table for post likes
create table post_likes (
    post_id uuid references posts(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    primary key (post_id, user_id)
);

-- Junction table for post comments
create table post_comments (
    post_id uuid references posts(id) on delete cascade,
    comment_id uuid references posts(id) on delete cascade,
    primary key (post_id, comment_id)
);

-- Junction table for post notifications
create table post_notifications (
    post_id uuid references posts(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    primary key (post_id, user_id)
);

-- Create indexes for better performance
create index idx_projects_crew on project_crew(project_id, user_id);
create index idx_projects_owners on project_owners(project_id, user_id);
create index idx_shots_project on shots(project_id);
create index idx_shots_sequence on shots(sequence_id);
create index idx_assets_project on assets(project_id);
create index idx_tasks_shot on tasks(shot_id);
create index idx_tasks_asset on tasks(asset_id);
create index idx_takes_task on takes(task_id);
create index idx_reviews_task on reviews(task_id);
create index idx_notes_review on notes(review_id);
create index idx_posts_project on posts(project_id);

-- Enable Row Level Security
alter table projects enable row level security;
alter table project_owners enable row level security;
alter table project_crew enable row level security;
alter table sequences enable row level security;
alter table shots enable row level security;
alter table assets enable row level security;
alter table tasks enable row level security;
alter table takes enable row level security;
alter table reviews enable row level security;
alter table review_cc enable row level security;
alter table notes enable row level security;
alter table note_likes enable row level security;
alter table posts enable row level security;
alter table post_likes enable row level security;
alter table post_comments enable row level security;
alter table post_notifications enable row level security;

-- Create RLS Policies

-- Projects policies
create policy "Users can view projects they are crew members of"
    on projects for select
    using (
        exists (
            select 1 from project_crew
            where project_crew.project_id = projects.id
            and project_crew.user_id = auth.uid()
        )
    );

create policy "Project owners can manage their projects"
    on projects for all
    using (
        exists (
            select 1 from project_owners
            where project_owners.project_id = projects.id
            and project_owners.user_id = auth.uid()
        )
    );

-- Super user policies
drop policy if exists "Super users can access all projects" on projects;
create policy "Super users can access all projects"
    on projects for all
    using (is_super_user());

drop policy if exists "Super users can access all sequences" on sequences;
create policy "Super users can access all sequences"
    on sequences for all
    using (is_super_user());

drop policy if exists "Super users can access all shots" on shots;
create policy "Super users can access all shots"
    on shots for all
    using (is_super_user());

drop policy if exists "Super users can access all assets" on assets;
create policy "Super users can access all assets"
    on assets for all
    using (is_super_user());

drop policy if exists "Super users can access all tasks" on tasks;
create policy "Super users can access all tasks"
    on tasks for all
    using (is_super_user());

drop policy if exists "Super users can access all takes" on takes;
create policy "Super users can access all takes"
    on takes for all
    using (is_super_user());

drop policy if exists "Super users can access all reviews" on reviews;
create policy "Super users can access all reviews"
    on reviews for all
    using (is_super_user());

drop policy if exists "Super users can access all notes" on notes;
create policy "Super users can access all notes"
    on notes for all
    using (is_super_user());

drop policy if exists "Super users can access all posts" on posts;
create policy "Super users can access all posts"
    on posts for all
    using (is_super_user());

-- Project crew policies
create policy "Users can view project crew lists they are part of"
    on project_crew for select
    using (
        user_id = auth.uid()
    );

create policy "Project owners can manage crew lists"
    on project_crew for all
    using (
        exists (
            select 1 from project_owners
            where project_owners.project_id = project_crew.project_id
            and project_owners.user_id = auth.uid()
        )
    );

-- Sequences policies
create policy "Users can view sequences from projects they are crew members of"
    on sequences for select
    using (
        exists (
            select 1 from project_crew
            where project_crew.project_id = sequences.project_id
            and project_crew.user_id = auth.uid()
        )
    );

create policy "Project owners can manage sequences"
    on sequences for all
    using (
        exists (
            select 1 from project_owners
            where project_owners.project_id = sequences.project_id
            and project_owners.user_id = auth.uid()
        )
    );

-- Shots policies
create policy "Users can view shots from projects they are crew members of"
    on shots for select
    using (
        exists (
            select 1 from project_crew
            where project_crew.project_id = shots.project_id
            and project_crew.user_id = auth.uid()
        )
    );

create policy "Project owners can manage shots"
    on shots for all
    using (
        exists (
            select 1 from project_owners
            where project_owners.project_id = shots.project_id
            and project_owners.user_id = auth.uid()
        )
    );

-- Assets policies
create policy "Users can view assets from projects they are crew members of"
    on assets for select
    using (
        exists (
            select 1 from project_crew
            where project_crew.project_id = assets.project_id
            and project_crew.user_id = auth.uid()
        )
    );

create policy "Project owners can manage assets"
    on assets for all
    using (
        exists (
            select 1 from project_owners
            where project_owners.project_id = assets.project_id
            and project_owners.user_id = auth.uid()
        )
    );

-- Tasks policies
create policy "Users can view tasks from projects they are crew members of"
    on tasks for select
    using (
        exists (
            select 1 from project_crew
            where project_crew.project_id = coalesce(
                (select project_id from shots where id = tasks.shot_id),
                (select project_id from assets where id = tasks.asset_id)
            )
            and project_crew.user_id = auth.uid()
        )
    );

create policy "Project owners can manage tasks"
    on tasks for all
    using (
        exists (
            select 1 from project_owners
            where project_owners.project_id = coalesce(
                (select project_id from shots where id = tasks.shot_id),
                (select project_id from assets where id = tasks.asset_id)
            )
            and project_owners.user_id = auth.uid()
        )
    );

-- Takes policies
create policy "Users can view takes from projects they are crew members of"
    on takes for select
    using (
        exists (
            select 1 from project_crew
            where project_crew.project_id = (
                select coalesce(
                    (select project_id from shots where id = tasks.shot_id),
                    (select project_id from assets where id = tasks.asset_id)
                )
                from tasks
                where tasks.id = takes.task_id
            )
            and project_crew.user_id = auth.uid()
        )
    );

create policy "Project owners can manage takes"
    on takes for all
    using (
        exists (
            select 1 from project_owners
            where project_owners.project_id = (
                select coalesce(
                    (select project_id from shots where id = tasks.shot_id),
                    (select project_id from assets where id = tasks.asset_id)
                )
                from tasks
                where tasks.id = takes.task_id
            )
            and project_owners.user_id = auth.uid()
        )
    );

-- Reviews policies
create policy "Users can view reviews from projects they are crew members of"
    on reviews for select
    using (
        exists (
            select 1 from project_crew
            where project_crew.project_id = (
                select coalesce(
                    (select project_id from shots where id = tasks.shot_id),
                    (select project_id from assets where id = tasks.asset_id)
                )
                from tasks
                where tasks.id = reviews.task_id
            )
            and project_crew.user_id = auth.uid()
        )
    );

create policy "Project owners can manage reviews"
    on reviews for all
    using (
        exists (
            select 1 from project_owners
            where project_owners.project_id = (
                select coalesce(
                    (select project_id from shots where id = tasks.shot_id),
                    (select project_id from assets where id = tasks.asset_id)
                )
                from tasks
                where tasks.id = reviews.task_id
            )
            and project_owners.user_id = auth.uid()
        )
    );

-- Notes policies
create policy "Users can view notes from projects they are crew members of"
    on notes for select
    using (
        exists (
            select 1 from project_crew
            where project_crew.project_id = (
                select coalesce(
                    (select project_id from shots where id = tasks.shot_id),
                    (select project_id from assets where id = tasks.asset_id)
                )
                from tasks
                join reviews on reviews.task_id = tasks.id
                where reviews.id = notes.review_id
            )
            and project_crew.user_id = auth.uid()
        )
    );

create policy "Project owners can manage notes"
    on notes for all
    using (
        exists (
            select 1 from project_owners
            where project_owners.project_id = (
                select coalesce(
                    (select project_id from shots where id = tasks.shot_id),
                    (select project_id from assets where id = tasks.asset_id)
                )
                from tasks
                join reviews on reviews.task_id = tasks.id
                where reviews.id = notes.review_id
            )
            and project_owners.user_id = auth.uid()
        )
    );

-- Posts policies
create policy "Users can view posts from projects they are crew members of"
    on posts for select
    using (
        exists (
            select 1 from project_crew
            where project_crew.project_id = posts.project_id
            and project_crew.user_id = auth.uid()
        )
    );

create policy "Project owners can manage posts"
    on posts for all
    using (
        exists (
            select 1 from project_owners
            where project_owners.project_id = posts.project_id
            and project_owners.user_id = auth.uid()
        )
    );

-- Post likes policies
create policy "Users can view likes from posts they can view"
    on post_likes for select
    using (
        exists (
            select 1 from posts
            join project_crew on project_crew.project_id = posts.project_id
            where posts.id = post_likes.post_id
            and project_crew.user_id = auth.uid()
        )
    );

create policy "Users can like posts they can view"
    on post_likes for insert
    with check (
        exists (
            select 1 from posts
            join project_crew on project_crew.project_id = posts.project_id
            where posts.id = post_likes.post_id
            and project_crew.user_id = auth.uid()
        )
        and user_id = auth.uid()
    );

create policy "Users can unlike their own likes"
    on post_likes for delete
    using (user_id = auth.uid());

-- Grant super users full access to post_likes
create policy "Super users can manage all likes"
    on post_likes for all
    using (is_super_user());

-- Create functions for automatic timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for automatic timestamps
create trigger update_projects_updated_at
    before update on projects
    for each row
    execute function update_updated_at_column();

create trigger update_sequences_updated_at
    before update on sequences
    for each row
    execute function update_updated_at_column();

create trigger update_shots_updated_at
    before update on shots
    for each row
    execute function update_updated_at_column();

create trigger update_assets_updated_at
    before update on assets
    for each row
    execute function update_updated_at_column();

create trigger update_tasks_updated_at
    before update on tasks
    for each row
    execute function update_updated_at_column();

create trigger update_takes_updated_at
    before update on takes
    for each row
    execute function update_updated_at_column();

create trigger update_reviews_updated_at
    before update on reviews
    for each row
    execute function update_updated_at_column();

create trigger update_notes_updated_at
    before update on notes
    for each row
    execute function update_updated_at_column();

create trigger update_posts_updated_at
    before update on posts
    for each row
    execute function update_updated_at_column();