CREATE TABLE IF NOT EXISTS users (
    user_id TEXT,
    user_pass TEXT,
    totp_secret TEXT,
    profile_bio TEXT,
    profile_img TEXT,
    created_time TEXT,
    created_user TEXT,
    updated_time TEXT,
    updated_user TEXT,
    PRIMARY KEY (user_id)
);
