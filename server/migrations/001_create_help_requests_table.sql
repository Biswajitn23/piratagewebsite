-- Migration: create help_requests table for Need Help submissions

create table if not exists help_requests (
  id text primary key,
  name text not null,
  email text not null,
  message text not null,
  topic text,
  created_at timestamptz default now()
);
