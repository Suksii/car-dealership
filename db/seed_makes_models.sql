-- Marke i modeli najčešći na tržištu CG. Dodaje se po potrebi iz admin panela.
INSERT INTO makes (name, slug, is_popular, sort_order) VALUES
('Volkswagen','volkswagen',true,1),('Audi','audi',true,2),('BMW','bmw',true,3),('Mercedes-Benz','mercedes-benz',true,4),
('Škoda','skoda',true,5),('Opel','opel',true,6),('Peugeot','peugeot',true,7),('Renault','renault',true,8),
('Citroën','citroen',true,9),('Fiat','fiat',true,10),('Ford','ford',true,11),('Toyota','toyota',true,12),
('Hyundai','hyundai',true,13),('Kia','kia',true,14),('Nissan','nissan',false,15),('Honda','honda',false,16),
('Mazda','mazda',false,17),('Seat','seat',false,18),('Dacia','dacia',false,19),('Volvo','volvo',false,20),
('Alfa Romeo','alfa-romeo',false,21),('Lancia','lancia',false,22),('Suzuki','suzuki',false,23),('Mitsubishi','mitsubishi',false,24),
('Chevrolet','chevrolet',false,25),('Jeep','jeep',false,26),('Land Rover','land-rover',false,27),('Porsche','porsche',false,28),
('Mini','mini',false,29),('Smart','smart',false,30),('Lexus','lexus',false,31),('Subaru','subaru',false,32),
('Tesla','tesla',false,33),('Cupra','cupra',false,34),('DS','ds',false,35),('Jaguar','jaguar',false,36),
('Saab','saab',false,37),('Chrysler','chrysler',false,38),('Dodge','dodge',false,39),('Daewoo','daewoo',false,40),
('Lada','lada',false,41),('Zastava','zastava',false,42),('Yugo','yugo',false,43),('Daihatsu','daihatsu',false,44),
('Rover','rover',false,45),('MG','mg',false,46),('SsangYong','ssangyong',false,47),('Isuzu','isuzu',false,48),
('Infiniti','infiniti',false,49),('Maserati','maserati',false,50),('BYD','byd',false,51),('Ostalo','ostalo',false,999);

-- Modeli: (marka slug, naziv, slug)
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM (VALUES
-- Volkswagen
('volkswagen','Polo','polo'),('volkswagen','Golf','golf'),('volkswagen','Golf Plus','golf-plus'),('volkswagen','Jetta','jetta'),
('volkswagen','Passat','passat'),('volkswagen','Passat CC','passat-cc'),('volkswagen','Arteon','arteon'),('volkswagen','Bora','bora'),
('volkswagen','Tiguan','tiguan'),('volkswagen','Touran','touran'),('volkswagen','Sharan','sharan'),('volkswagen','Touareg','touareg'),
('volkswagen','T-Roc','t-roc'),('volkswagen','T-Cross','t-cross'),('volkswagen','Taigo','taigo'),('volkswagen','Up!','up'),
('volkswagen','Caddy','caddy'),('volkswagen','Transporter','transporter'),('volkswagen','Multivan','multivan'),('volkswagen','Scirocco','scirocco'),
('volkswagen','Beetle','beetle'),('volkswagen','ID.3','id3'),('volkswagen','ID.4','id4'),('volkswagen','Amarok','amarok'),('volkswagen','Ostalo','ostalo'),
-- Audi
('audi','A1','a1'),('audi','A3','a3'),('audi','A4','a4'),('audi','A4 Allroad','a4-allroad'),('audi','A5','a5'),('audi','A6','a6'),
('audi','A6 Allroad','a6-allroad'),('audi','A7','a7'),('audi','A8','a8'),('audi','Q2','q2'),('audi','Q3','q3'),('audi','Q5','q5'),
('audi','Q7','q7'),('audi','Q8','q8'),('audi','TT','tt'),('audi','e-tron','e-tron'),('audi','Ostalo','ostalo'),
-- BMW
('bmw','Serija 1','serija-1'),('bmw','Serija 2','serija-2'),('bmw','Serija 3','serija-3'),('bmw','Serija 4','serija-4'),
('bmw','Serija 5','serija-5'),('bmw','Serija 6','serija-6'),('bmw','Serija 7','serija-7'),('bmw','Serija 8','serija-8'),
('bmw','X1','x1'),('bmw','X2','x2'),('bmw','X3','x3'),('bmw','X4','x4'),('bmw','X5','x5'),('bmw','X6','x6'),('bmw','X7','x7'),
('bmw','Z4','z4'),('bmw','i3','i3'),('bmw','iX','ix'),('bmw','Ostalo','ostalo'),
-- Mercedes-Benz
('mercedes-benz','A klasa','a-klasa'),('mercedes-benz','B klasa','b-klasa'),('mercedes-benz','C klasa','c-klasa'),('mercedes-benz','CLA','cla'),
('mercedes-benz','CLS','cls'),('mercedes-benz','E klasa','e-klasa'),('mercedes-benz','S klasa','s-klasa'),('mercedes-benz','GLA','gla'),
('mercedes-benz','GLB','glb'),('mercedes-benz','GLC','glc'),('mercedes-benz','GLE','gle'),('mercedes-benz','GLS','gls'),('mercedes-benz','ML','ml'),
('mercedes-benz','GL','gl'),('mercedes-benz','G klasa','g-klasa'),('mercedes-benz','Vito','vito'),('mercedes-benz','V klasa','v-klasa'),
('mercedes-benz','Sprinter','sprinter'),('mercedes-benz','Citan','citan'),('mercedes-benz','EQ','eq'),('mercedes-benz','Ostalo','ostalo'),
-- Škoda
('skoda','Fabia','fabia'),('skoda','Octavia','octavia'),('skoda','Superb','superb'),('skoda','Rapid','rapid'),('skoda','Scala','scala'),
('skoda','Kamiq','kamiq'),('skoda','Karoq','karoq'),('skoda','Kodiaq','kodiaq'),('skoda','Yeti','yeti'),('skoda','Roomster','roomster'),
('skoda','Citigo','citigo'),('skoda','Enyaq','enyaq'),('skoda','Ostalo','ostalo'),
-- Opel
('opel','Corsa','corsa'),('opel','Astra','astra'),('opel','Insignia','insignia'),('opel','Vectra','vectra'),('opel','Zafira','zafira'),
('opel','Meriva','meriva'),('opel','Mokka','mokka'),('opel','Crossland','crossland'),('opel','Grandland','grandland'),('opel','Antara','antara'),
('opel','Combo','combo'),('opel','Vivaro','vivaro'),('opel','Adam','adam'),('opel','Agila','agila'),('opel','Ostalo','ostalo'),
-- Peugeot
('peugeot','107','107'),('peugeot','108','108'),('peugeot','206','206'),('peugeot','207','207'),('peugeot','208','208'),('peugeot','307','307'),
('peugeot','308','308'),('peugeot','407','407'),('peugeot','508','508'),('peugeot','2008','2008'),('peugeot','3008','3008'),('peugeot','5008','5008'),
('peugeot','Partner','partner'),('peugeot','Rifter','rifter'),('peugeot','Expert','expert'),('peugeot','Boxer','boxer'),('peugeot','Ostalo','ostalo'),
-- Renault
('renault','Clio','clio'),('renault','Megane','megane'),('renault','Laguna','laguna'),('renault','Talisman','talisman'),('renault','Scenic','scenic'),
('renault','Grand Scenic','grand-scenic'),('renault','Captur','captur'),('renault','Kadjar','kadjar'),('renault','Koleos','koleos'),('renault','Arkana','arkana'),
('renault','Austral','austral'),('renault','Twingo','twingo'),('renault','Kangoo','kangoo'),('renault','Trafic','trafic'),('renault','Master','master'),
('renault','Zoe','zoe'),('renault','Ostalo','ostalo'),
-- Citroën
('citroen','C1','c1'),('citroen','C2','c2'),('citroen','C3','c3'),('citroen','C3 Aircross','c3-aircross'),('citroen','C4','c4'),
('citroen','C4 Picasso','c4-picasso'),('citroen','C4 Cactus','c4-cactus'),('citroen','C5','c5'),('citroen','C5 Aircross','c5-aircross'),
('citroen','Berlingo','berlingo'),('citroen','Jumpy','jumpy'),('citroen','Jumper','jumper'),('citroen','Xsara','xsara'),('citroen','Ostalo','ostalo'),
-- Fiat
('fiat','Punto','punto'),('fiat','Grande Punto','grande-punto'),('fiat','500','500'),('fiat','500L','500l'),('fiat','500X','500x'),('fiat','Panda','panda'),
('fiat','Tipo','tipo'),('fiat','Bravo','bravo'),('fiat','Stilo','stilo'),('fiat','Doblo','doblo'),('fiat','Ducato','ducato'),('fiat','Freemont','freemont'),
('fiat','Ostalo','ostalo'),
-- Ford
('ford','Fiesta','fiesta'),('ford','Focus','focus'),('ford','Mondeo','mondeo'),('ford','Kuga','kuga'),('ford','Puma','puma'),('ford','EcoSport','ecosport'),
('ford','C-Max','c-max'),('ford','S-Max','s-max'),('ford','Galaxy','galaxy'),('ford','Transit','transit'),('ford','Transit Custom','transit-custom'),
('ford','Ranger','ranger'),('ford','Mustang','mustang'),('ford','Ka','ka'),('ford','Ostalo','ostalo'),
-- Toyota
('toyota','Yaris','yaris'),('toyota','Yaris Cross','yaris-cross'),('toyota','Corolla','corolla'),('toyota','Auris','auris'),('toyota','Avensis','avensis'),
('toyota','Camry','camry'),('toyota','C-HR','c-hr'),('toyota','RAV4','rav4'),('toyota','Land Cruiser','land-cruiser'),('toyota','Hilux','hilux'),
('toyota','Aygo','aygo'),('toyota','Prius','prius'),('toyota','Proace','proace'),('toyota','Ostalo','ostalo'),
-- Hyundai
('hyundai','i10','i10'),('hyundai','i20','i20'),('hyundai','i30','i30'),('hyundai','i40','i40'),('hyundai','Elantra','elantra'),('hyundai','Accent','accent'),
('hyundai','Getz','getz'),('hyundai','Kona','kona'),('hyundai','Bayon','bayon'),('hyundai','Tucson','tucson'),('hyundai','Santa Fe','santa-fe'),
('hyundai','ix35','ix35'),('hyundai','ix20','ix20'),('hyundai','Ioniq','ioniq'),('hyundai','Ostalo','ostalo'),
-- Kia
('kia','Picanto','picanto'),('kia','Rio','rio'),('kia','Ceed','ceed'),('kia','XCeed','xceed'),('kia','Stonic','stonic'),('kia','Sportage','sportage'),
('kia','Sorento','sorento'),('kia','Niro','niro'),('kia','Optima','optima'),('kia','Carens','carens'),('kia','Soul','soul'),('kia','EV6','ev6'),('kia','Ostalo','ostalo'),
-- Nissan
('nissan','Micra','micra'),('nissan','Note','note'),('nissan','Juke','juke'),('nissan','Qashqai','qashqai'),('nissan','X-Trail','x-trail'),
('nissan','Navara','navara'),('nissan','Leaf','leaf'),('nissan','Pathfinder','pathfinder'),('nissan','Primera','primera'),('nissan','Ostalo','ostalo'),
-- Honda
('honda','Jazz','jazz'),('honda','Civic','civic'),('honda','Accord','accord'),('honda','CR-V','cr-v'),('honda','HR-V','hr-v'),('honda','Ostalo','ostalo'),
-- Mazda
('mazda','2','2'),('mazda','3','3'),('mazda','5','5'),('mazda','6','6'),('mazda','CX-3','cx-3'),('mazda','CX-30','cx-30'),('mazda','CX-5','cx-5'),
('mazda','CX-60','cx-60'),('mazda','MX-5','mx-5'),('mazda','Ostalo','ostalo'),
-- Seat
('seat','Ibiza','ibiza'),('seat','Leon','leon'),('seat','Altea','altea'),('seat','Toledo','toledo'),('seat','Arona','arona'),('seat','Ateca','ateca'),
('seat','Tarraco','tarraco'),('seat','Alhambra','alhambra'),('seat','Ostalo','ostalo'),
-- Dacia
('dacia','Sandero','sandero'),('dacia','Logan','logan'),('dacia','Duster','duster'),('dacia','Jogger','jogger'),('dacia','Spring','spring'),
('dacia','Lodgy','lodgy'),('dacia','Dokker','dokker'),('dacia','Ostalo','ostalo'),
-- Volvo
('volvo','V40','v40'),('volvo','V50','v50'),('volvo','V60','v60'),('volvo','V70','v70'),('volvo','V90','v90'),('volvo','S60','s60'),('volvo','S80','s80'),
('volvo','S90','s90'),('volvo','XC40','xc40'),('volvo','XC60','xc60'),('volvo','XC70','xc70'),('volvo','XC90','xc90'),('volvo','Ostalo','ostalo'),
-- Alfa Romeo
('alfa-romeo','147','147'),('alfa-romeo','156','156'),('alfa-romeo','159','159'),('alfa-romeo','Giulietta','giulietta'),('alfa-romeo','Giulia','giulia'),
('alfa-romeo','MiTo','mito'),('alfa-romeo','Stelvio','stelvio'),('alfa-romeo','Tonale','tonale'),('alfa-romeo','Ostalo','ostalo'),
-- Lancia
('lancia','Ypsilon','ypsilon'),('lancia','Delta','delta'),('lancia','Musa','musa'),('lancia','Ostalo','ostalo'),
-- Suzuki
('suzuki','Swift','swift'),('suzuki','Vitara','vitara'),('suzuki','Grand Vitara','grand-vitara'),('suzuki','S-Cross','s-cross'),('suzuki','Jimny','jimny'),
('suzuki','Ignis','ignis'),('suzuki','SX4','sx4'),('suzuki','Ostalo','ostalo'),
-- Mitsubishi
('mitsubishi','ASX','asx'),('mitsubishi','Outlander','outlander'),('mitsubishi','Pajero','pajero'),('mitsubishi','L200','l200'),('mitsubishi','Colt','colt'),
('mitsubishi','Lancer','lancer'),('mitsubishi','Space Star','space-star'),('mitsubishi','Ostalo','ostalo'),
-- Chevrolet
('chevrolet','Spark','spark'),('chevrolet','Aveo','aveo'),('chevrolet','Cruze','cruze'),('chevrolet','Captiva','captiva'),('chevrolet','Orlando','orlando'),
('chevrolet','Ostalo','ostalo'),
-- Jeep
('jeep','Renegade','renegade'),('jeep','Compass','compass'),('jeep','Cherokee','cherokee'),('jeep','Grand Cherokee','grand-cherokee'),('jeep','Wrangler','wrangler'),
('jeep','Avenger','avenger'),('jeep','Ostalo','ostalo'),
-- Land Rover
('land-rover','Range Rover','range-rover'),('land-rover','Range Rover Sport','range-rover-sport'),('land-rover','Range Rover Evoque','range-rover-evoque'),
('land-rover','Range Rover Velar','range-rover-velar'),('land-rover','Discovery','discovery'),('land-rover','Discovery Sport','discovery-sport'),
('land-rover','Defender','defender'),('land-rover','Freelander','freelander'),('land-rover','Ostalo','ostalo'),
-- Porsche
('porsche','Cayenne','cayenne'),('porsche','Macan','macan'),('porsche','Panamera','panamera'),('porsche','911','911'),('porsche','Taycan','taycan'),
('porsche','Boxster','boxster'),('porsche','Cayman','cayman'),('porsche','Ostalo','ostalo'),
-- Mini
('mini','Cooper','cooper'),('mini','One','one'),('mini','Countryman','countryman'),('mini','Clubman','clubman'),('mini','Ostalo','ostalo'),
-- Smart
('smart','ForTwo','fortwo'),('smart','ForFour','forfour'),('smart','Ostalo','ostalo'),
-- Lexus
('lexus','IS','is'),('lexus','ES','es'),('lexus','NX','nx'),('lexus','RX','rx'),('lexus','UX','ux'),('lexus','CT','ct'),('lexus','Ostalo','ostalo'),
-- Subaru
('subaru','Forester','forester'),('subaru','Outback','outback'),('subaru','XV','xv'),('subaru','Impreza','impreza'),('subaru','Legacy','legacy'),('subaru','Ostalo','ostalo'),
-- Tesla
('tesla','Model 3','model-3'),('tesla','Model Y','model-y'),('tesla','Model S','model-s'),('tesla','Model X','model-x'),
-- Cupra
('cupra','Formentor','formentor'),('cupra','Leon','leon'),('cupra','Ateca','ateca'),('cupra','Born','born'),('cupra','Ostalo','ostalo'),
-- DS
('ds','DS 3','ds-3'),('ds','DS 4','ds-4'),('ds','DS 7','ds-7'),('ds','Ostalo','ostalo'),
-- Jaguar
('jaguar','XE','xe'),('jaguar','XF','xf'),('jaguar','XJ','xj'),('jaguar','F-Pace','f-pace'),('jaguar','E-Pace','e-pace'),('jaguar','Ostalo','ostalo'),
-- Saab
('saab','9-3','9-3'),('saab','9-5','9-5'),('saab','Ostalo','ostalo'),
-- Chrysler
('chrysler','300C','300c'),('chrysler','Voyager','voyager'),('chrysler','Grand Voyager','grand-voyager'),('chrysler','Ostalo','ostalo'),
-- Dodge
('dodge','Caliber','caliber'),('dodge','Journey','journey'),('dodge','Nitro','nitro'),('dodge','RAM','ram'),('dodge','Ostalo','ostalo'),
-- Daewoo
('daewoo','Matiz','matiz'),('daewoo','Lanos','lanos'),('daewoo','Nubira','nubira'),('daewoo','Kalos','kalos'),('daewoo','Ostalo','ostalo'),
-- Lada
('lada','Niva','niva'),('lada','Samara','samara'),('lada','Ostalo','ostalo'),
-- Zastava / Yugo
('zastava','10','10'),('zastava','101','101'),('zastava','128','128'),('zastava','Ostalo','ostalo'),
('yugo','Koral','koral'),('yugo','Florida','florida'),('yugo','Tempo','tempo'),('yugo','Ostalo','ostalo'),
-- Daihatsu
('daihatsu','Terios','terios'),('daihatsu','Sirion','sirion'),('daihatsu','Cuore','cuore'),('daihatsu','Ostalo','ostalo'),
-- Rover / MG
('rover','25','25'),('rover','45','45'),('rover','75','75'),('rover','Ostalo','ostalo'),
('mg','ZS','zs'),('mg','HS','hs'),('mg','MG4','mg4'),('mg','Ostalo','ostalo'),
-- SsangYong
('ssangyong','Tivoli','tivoli'),('ssangyong','Korando','korando'),('ssangyong','Rexton','rexton'),('ssangyong','Kyron','kyron'),('ssangyong','Ostalo','ostalo'),
-- Isuzu
('isuzu','D-Max','d-max'),('isuzu','Ostalo','ostalo'),
-- Infiniti
('infiniti','Q30','q30'),('infiniti','Q50','q50'),('infiniti','QX70','qx70'),('infiniti','Ostalo','ostalo'),
-- Maserati
('maserati','Ghibli','ghibli'),('maserati','Levante','levante'),('maserati','Quattroporte','quattroporte'),('maserati','Ostalo','ostalo'),
-- BYD
('byd','Atto 3','atto-3'),('byd','Dolphin','dolphin'),('byd','Seal','seal'),('byd','Ostalo','ostalo'),
-- Ostalo
('ostalo','Ostalo','ostalo')
) AS v(make_slug, name, slug)
JOIN makes m ON m.slug = v.make_slug;
