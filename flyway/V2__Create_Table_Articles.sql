CREATE TABLE IF NOT EXISTS articales (
    post_id VARCHAR(9),
    post_title TEXT,
    post_sub_title TEXT,
    post_serie TEXT,
    post_content TEXT,
    post_img TEXT,
    post_status VARCHAR(2), -- DL: Deleted, PT: Posted, DR: Draft
    created_time TEXT,
    created_user TEXT,
    updated_time TEXT,
    updated_user TEXT,
    PRIMARY KEY (post_id)
);

CREATE TABLE IF NOT EXISTS series (
    serie_name TEXT,
    PRIMARY KEY (serie_name)
);

CREATE TABLE IF NOT EXISTS articales_tags (
    post_id VARCHAR(9), 
    tag_name TEXT,
    PRIMARY KEY (post_id, tag_name)
);

CREATE TABLE IF NOT EXISTS tags (
    tag_name TEXT,
    PRIMARY KEY (tag_name)
);

CREATE TABLE IF NOT EXISTS articales_langs (
    post_id VARCHAR(9), 
    lang_name TEXT,
    PRIMARY KEY (post_id, lang_name)
);

CREATE TABLE IF NOT EXISTS langs (
    lang_name TEXT,
    PRIMARY KEY (lang_name)
);
