-- Migration: create gallery table for site gallery items
create table if not exists gallery (
  id text primary key,
  title text not null,
  category text,
  media text not null,
  orientation text,
  description text,
  created_at timestamptz default now()
);
