INSERT INTO places (
  place_light,
  place_dark,
  active
)
VALUES 
  ('Bar', 'Dark corner of the poolroom', true),
	('Cinema', 'Behind the cinema screen', true),
	('Cozy sofa', 'In a dumpster', true),
	('Park', 'Dark forest', true);

INSERT INTO attitudes (
  attitude_light,
  attitude_dark,
  active
)
VALUES 
	('Bullish', 'Loud and effective, TAC TAC TAC', true),
	('Dreamy', 'Patiently waits for the poison to diffuse', true),
	('Focused', 'Quietly waiting in the dark, ready to act', true),
	('Shy', 'Insidious, making others mad', true);

INSERT INTO weapons (
  weapon_light,
  weapon_dark,
  active
)
VALUES 
	('Party', 'GHB', true),
	('Brain', 'Humiliation', true),
	('Sex appeal', 'Bondage', true),
	('Charm', '16 ton weight', true);

INSERT INTO tag_questions (
  places_question,
  attitudes_question,
  weapons_question
) VALUES (
  'Define what place would best fit to your mood ?',
  'Which attitude defines you right now ?',
	'What is you lethal weapon ?'
);
