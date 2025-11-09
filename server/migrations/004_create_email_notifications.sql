-- Create a function to notify subscribers about new events
-- This function will be called by a trigger when a new event is inserted

-- Note: To send actual emails, you'll need to:
-- 1. Enable Supabase's email service or integrate with a service like SendGrid, Resend, or AWS SES
-- 2. Set up a webhook or Edge Function that calls your email API
-- 3. Store email jobs in a queue table for processing

-- For now, we'll create a notification log table to track what needs to be sent
create table if not exists email_notifications (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_title text not null,
  sent_to_count integer default 0,
  status text default 'pending', -- pending, processing, sent, failed
  created_at timestamptz default now(),
  sent_at timestamptz,
  error_message text
);

-- Create a function that logs notifications when new events are created
create or replace function notify_subscribers_on_new_event()
returns trigger as $$
declare
  subscriber_count integer;
begin
  -- Count active subscribers
  select count(*) into subscriber_count
  from subscribers
  where is_active = true;

  -- Log the notification job
  insert into email_notifications (event_id, event_title, sent_to_count, status)
  values (NEW.id, NEW.title, subscriber_count, 'pending');

  return NEW;
end;
$$ language plpgsql;

-- Create trigger to run when new events are inserted
drop trigger if exists trigger_notify_subscribers on events;
create trigger trigger_notify_subscribers
  after insert on events
  for each row
  execute function notify_subscribers_on_new_event();

-- Create an index for better performance
create index if not exists idx_email_notifications_status on email_notifications(status);
create index if not exists idx_email_notifications_created_at on email_notifications(created_at);
