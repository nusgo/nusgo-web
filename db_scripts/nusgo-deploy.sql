create schema nusgo;

create table nusgo.users (
    id varchar(128) constraint users_pk primary key,
    name varchar(500) null
);

create table nusgo.markers (
    id serial constraint markers_pk primary key,
    lat double precision not null,
    lng double precision not null,
    meal_type varchar(20) not null,
    message text null,
    meal_time timestamp with time zone not null,
    created_time timestamp with time zone not null default now(),
    user_id varchar(128) references nusgo.users(id) on update cascade on delete cascade
);

create table nusgo.users_markers (
    marker_id int references nusgo.markers(id) on update cascade on delete cascade,
    user_id varchar(128) references nusgo.users(id) on update cascade on delete cascade
);

grant usage on schema nusgo to nusgo;
grant select on all tables in schema nusgo to nusgo;
grant insert on all tables in schema nusgo to nusgo;
grant update on all tables in schema nusgo to nusgo;
grant delete on table nusgo.users_markers to nusgo;
grant usage, select on sequence markers_id_seq to nusgo;

-- Execute the syntax below to append nusgo schema to your search_path
select set_config(
    'search_path',
    current_setting('search_path') || ', nusgo',
    false
);
