create table saved_tweets (
  id uuid default uuid_generate_v4() primary key,
  tweet_content text not null,
  original_prompt text not null,
  case_id uuid not null,
  saved_at timestamp with time zone default timezone('utc'::text, now()) not null
); 