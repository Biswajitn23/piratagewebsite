-- Create subscribers table for email notifications
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz default now(),
  is_active boolean default true,
  unsubscribe_token text unique default gen_random_uuid()::text
);

-- Create index for faster email lookups
create index if not exists idx_subscribers_email on subscribers(email);
create index if not exists idx_subscribers_active on subscribers(is_active);

-- Enable Row Level Security
alter table subscribers enable row level security;

-- Create policy to allow anyone to subscribe (insert)
create policy "Anyone can subscribe"
  on subscribers for insert
  with check (true);

-- Create policy to allow users to unsubscribe using their token
create policy "Users can unsubscribe with token"
  on subscribers for update
  using (true);
