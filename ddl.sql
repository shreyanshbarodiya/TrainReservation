drop table IF EXISTS travels_in;
drop table IF EXISTS passenger;
drop table IF EXISTS ticket;
drop table IF EXISTS transaction;
drop table IF EXISTS runs_on;
drop table IF EXISTS schedule;
drop table IF EXISTS coach;
drop table IF EXISTS "user";
drop table IF EXISTS station;
drop table IF EXISTS train;

create table train
	(train_no				varchar(5),
	 name					varchar(100),
	 train_type				varchar(100),
	 primary key (train_no)
	);

create table station
	(station_id				varchar(5),
	 name					varchar(100),
	 city					varchar(100),
	 primary key (station_id)
	);

create table "user"
	(username				varchar(20),
	 name					varchar(100),
	 password				text,
	 ph_no					numeric(10,0),
	 balance				integer,
	 primary key (username)
	);

create table runs_on
	(train_no				varchar(5),
	 day_of_week			small int check (day_of_week in(0,1,2,3,4,5,6)),
	 primary key (train_no, day_of_week),
	 foreign key (train_no) references train(train_no) on delete cascade
	);

create table coach
	(train_no				varchar(5),
	 coach_id				varchar(5),
	 coach_class			varchar(10) check (coach_class in ('SL', '1A', '2A', '3A', 'CC', '2S', 'GEN')),
	 capacity				integer,
	 primary key (train_no,coach_id),
	 foreign key (train_no) references train(train_no) on delete cascade
	);

create table schedule
	(train_no				varchar(5),
	 station_id				varchar(5),
	 arrival_time			time,
	 departure_time			time,
	 station_count			integer,
	 days					integer,
	 distance				integer,
	 primary key (train_no,station_id),
	 foreign key (train_no) references train(train_no) on delete cascade,
	 foreign key (station_id) references station(station_id) on delete cascade
	);

create table transaction
	(txn_id					numeric(12,0),
	 username				varchar(100),
	 debit					numeric(1,0),
	 credit					numeric(1,0) check (credit != debit),
	 primary key (txn_id),
	 foreign key (username) references "user"(username) on delete cascade
	);

create table ticket
	(PNR					numeric(10,0),
	 date_of_journey		date,
	 boarding_pt			varchar(5),
	 destination			varchar(5),
	 train_no				varchar(5),
	 username				varchar(100),
	 txn_id					numeric(12,0),
	 primary key (PNR),
	 foreign key (train_no) references train(train_no) on delete cascade,
	 foreign key (username) references "user"(username) on delete cascade,
	 foreign key (boarding_pt) references station
		on delete cascade,
	 foreign key (destination) references station
		on delete cascade,
	 foreign key (txn_id) references transaction(txn_id) on delete set null on update cascade
	);

create table passenger
	(PNR					numeric(10,0),
	 p_id					varchar(100),
	 name					varchar(100),
	 age					integer,
	 gender					varchar(20) check (gender in ('Male','Female')),
	 primary key (PNR,p_id),
	 foreign key (PNR) references ticket(PNR) on delete cascade
	);

create table travels_in
	(PNR					numeric(10,0),
	 p_id					varchar(100),
	 train_no				varchar(5),
	 coach_id				varchar(5),
	 seat_no				integer check (seat_no > 0),
	 status					varchar(2) check (status in ('WL','CNF')),
	 waitlist_no			integer,
	 preference				varchar(20) check (preference in ('Lower','Middle','Upper','Side Lower','Side Upper')),
	 primary key (PNR,p_id,train_no,coach_id),
	 foreign key (PNR,p_id) references passenger(PNR,p_id) on delete cascade,
	 foreign key (train_no,coach_id) references coach(train_no,coach_id) on delete cascade
	);
