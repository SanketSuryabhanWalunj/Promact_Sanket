
using Dapper;
using Npgsql;

namespace LakePulse.Data.SeedData
{
    public class StartupService : BackgroundService
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public StartupService(IConfiguration configuration,
            IServiceScopeFactory serviceScopeFactory)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("PostgresConnection");
            _serviceScopeFactory = serviceScopeFactory;
        }

        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await FeatureTableCreationSeedDataAsync();
            await ToolboxVendorsTableCreationSeedDataAsync();
            await ToolboxDeviceTypeTableCreationSeedDataAsync();
            await ToolboxPurchasesTableCreationSeedDataAsync();
            await AlertLevelSeedDataAsync();
            await AlertCategorieSeedDataAsync();
        }

        private async Task FeatureTableCreationSeedDataAsync()
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();
                string createTableQuery = @"
        CREATE TABLE IF NOT EXISTS features (
            feature_id VARCHAR(50) PRIMARY KEY,
            category VARCHAR(30),
            order_in_category SMALLINT,
            label VARCHAR(100),
            units VARCHAR(50),
            data_type VARCHAR(20),
            data_source VARCHAR(20),
            measurement_characteristic_id VARCHAR(50),
            field_id VARCHAR(50),
            editable SMALLINT,
            lower_limit DOUBLE PRECISION,
            upper_limit DOUBLE PRECISION,
            bound_type CHAR(1),
            lower_bound DOUBLE PRECISION,
            upper_bound DOUBLE PRECISION,
            allowed_categories TEXT,
            text_max_length smallint,
            decimal_rounding SMALLINT,
            description TEXT
        );";
                string insertQuery = "truncate table features;insert into features (feature_id, category, order_in_category, label, units, data_type, data_source, measurement_characteristic_id, field_id, editable, lower_limit, upper_limit, bound_type, lower_bound, upper_bound, allowed_categories, text_max_length, decimal_rounding, description) values\r\n('boat_landings','access',1,'Boat Landings','#','integer','features',NULL,'boat_landings',1,NULL,NULL,NULL,0,100,NULL,NULL,0,'Boat landings are key access points for recreational boating but pose risks to lake health and safety. They are major entry points for invasive species, as boats and trailers can carry zebra mussels, Eurasian watermilfoil, and other aquatic hitchhikers. Frequent boat traffic can also lead to fuel spills, oil leaks, and sediment disruption, affecting water clarity and aquatic ecosystems. Additionally, improper use of ramps and nearby parking areas can contribute to runoff pollution and shoreline erosion.'),\r\n('harbors_marinas','access',2,'Harbors / Marinas','#','integer','features',NULL,'harbors_marinas',1,NULL,NULL,NULL,0,100,NULL,NULL,0,'Harbors and marinas are high-traffic boating areas that introduce chemical pollution from fuel spills, antifouling paints, and wastewater discharge. The concentration of boats can increase wave action and sediment resuspension, leading to shoreline erosion and habitat disturbance. Dredging and construction activities can further disrupt fish spawning areas and aquatic vegetation, impacting biodiversity. Proper management, such as waste disposal stations, no-wake zones, and stormwater filtration, is crucial to balancing recreation with environmental protection.'),\r\n('swimming_beaches','access',3,'Swimming Beaches','#','integer','features',NULL,'swimming_beaches',1,NULL,NULL,NULL,0,100,NULL,NULL,0,'Swimming beaches are highly sensitive to bacterial contamination, including E. coli and harmful algal blooms (HABs), which pose risks to public health. Stormwater runoff, wastewater leakage, and wildlife waste can introduce pathogens, leading to swimming advisories or closures. Additionally, sudden drop-offs, strong currents, and unpredictable weather can create drowning hazards, making real-time monitoring of water quality and safety conditions essential.'),\r\n('aquatic_vegetation','biological',1,'Aquatic Vegetation','% cover','decimal','features',NULL,'aquatic_vegetation',1,5,90,'M',0,100,NULL,NULL,1,'Provides habitat for aquatic life, influences oxygen levels, and reflects nutrient availability, while excessive growth can indicate eutrophication or potential ecological imbalances.'),\r\n('chlorophyll_a','biological',2,'Chlorophyll-a','ug/L','decimal','measurement','chlorophyll_a','chlorophyll_a',0,0.5,100,'L',0,2000,NULL,NULL,1,'Serves as a key indicator of algal biomass, helping to assess eutrophication levels and potential risks from harmful algal blooms.'),\r\n('cryptosporidium','biological',3,'Cryptosporidium','cfu/100mL','integer','measurement','cryptosporidium','cryptosporidium',0,0,100,'L',NULL,NULL,NULL,NULL,0,'A parasite from warm blooded animals that may be found in water and can infect humans'),\r\n('cyanobacteria','biological',4,'Cyanobacteria','cells/mL','decimal','features',NULL,'cyanobacteria',1,0,1000000,'L',0,10000000,NULL,NULL,0,'Directly assesses the presence and abundance of harmful algae that can produce toxins, posing risks to aquatic ecosystems, drinking water, and recreational use.'),\r\n('escherichia_coli','biological',5,'E. Coli','cfu/100mL','integer','measurement','escherichia_coli','escherichia_coli',0,0,1000,'L',NULL,NULL,NULL,NULL,0,'A type of bacteria that is an indicator of possible pathogen presence and for which there are standards for human consumption and contact'),\r\n('fecal_coliform','biological',6,'Fecal Coliform','cfu/100mL','integer','measurement','fecal_coliform','fecal_coliform',0,0,1000,'L',NULL,NULL,NULL,NULL,0,'A type of bacteria that is an indicator of possible pathogen presence and for which there are standards for human consumption and contact'),\r\n('fish_population','biological',7,'Fish Population ','Y/N','categorical','features',NULL,'fish_population',1,NULL,NULL,NULL,NULL,NULL,'Y,N',NULL,1,'Reflects the overall ecological balance, water quality, and habitat conditions, serving as a key indicator of the lake’s ability to support a healthy aquatic ecosystem.'),\r\n('giardia','biological',8,'Giardia','cfu/100mL','integer','measurement','giardia','giardia',0,0,100,'L',NULL,NULL,NULL,NULL,0,'A parasite from warm blooded animals that may be found in water and can infect humans'),\r\n('invasive_species','biological',9,'Invasive Species','% of community as cover or biomass','decimal','features',NULL,'invasive_species',1,0,75,'L',0,100,NULL,NULL,1,'They disrupt ecosystems, outcompete native species, and can cause economic and ecological damage.'),\r\n('macroinvertebrates','biological',10,'Macroinvertebrates','Y/N','categorical','features',NULL,'macroinvertebrates',1,NULL,NULL,NULL,NULL,NULL,'Y,N',NULL,1,'They serve as bioindicators, reflecting long-term water quality and ecosystem health due to their sensitivity to pollution, habitat changes, and environmental stressors.'),\r\n('phycocyanin','biological',11,'Phycocyanin','ug/L','decimal','measurement','phycocyanin','phycocyanin',0,0,50,'L',0,100,NULL,NULL,1,'A specific indicator of cyanobacteria (blue-green algae), helping to identify the presence and severity of harmful algal blooms that can threaten water quality and safety.'),\r\n('phytoplankton','biological',12,'Phytoplankton','cfu/100mL','decimal','features',NULL,'phytoplankton',1,100,100000,'L',0,10000000,NULL,NULL,0,'Common expression of phytoplankton abundance, but since cell size varies, is not ideal for interpreting conditions'),\r\n('zooplankton','biological',13,'Zooplankton','Y/N','categorical','features',NULL,'zooplankton',1,NULL,NULL,NULL,NULL,NULL,'Y,N',NULL,1,'They form the base of the aquatic food web, provide insights into nutrient levels, and help identify imbalances that can lead to issues like algal blooms or ecosystem disruptions.'),\r\n('alkalinity','chemical',1,'Alkalinity','mg/L as CaCO3','decimal','features',NULL,'alkalinity',1,2,100,'M',0,250,NULL,NULL,1,'Reflects the water’s ability to neutralize acids, maintaining pH stability and buffering against environmental changes that can harm aquatic ecosystems.'),\r\n('ammonium_nitrogen','chemical',2,'Ammonium Nitrogen','mg/L','decimal','measurement','ammonium_nh4','ammonium_nh4',0,0,5,'L',0,10,NULL,NULL,2,'A readily available form of nitrogen for algae, can indicate organic pollution, and at high levels, is toxic to aquatic life.'),\r\n('cadmium','chemical',3,'Cadmium','ug/L','decimal','measurement','cadmium','cadmium',0,0,5,'L',0,500,NULL,NULL,1,'Possibly harmful contaminant of concern for many lake uses'),\r\n('calcium','chemical',4,'Calcium','mg/L','decimal','measurement','calcium','calcium',0,0,50,'M',0,200,NULL,NULL,1,'Relates to pH and alkalinity, suitability for mollusks, function of geology'),\r\n('chlorides','chemical',5,'Chlorides','mg/L','decimal','features',NULL,'chlorides',1,2,500,'L',0,2000,NULL,NULL,1,'Elevated levels can indicate pollution from road salt, agricultural runoff, or industrial discharges, impacting aquatic ecosystems and water quality.'),\r\n('chromium','chemical',6,'Chromium','ug/L','decimal','measurement','chromium','chromium',0,0,50,'L',0,1000,NULL,NULL,1,'Possibly harmful contaminant of concern for many lake uses'),\r\n('conductivity','chemical',7,'Conductivity','uS/cm','decimal','measurement','specific_conductance','specific_conductance',0,10,500,'M',0,1000,NULL,NULL,0,'Indicates the water’s ionic content, reflecting pollution levels, salinity, and overall water quality.'),\r\n('copper','chemical',8,'Copper','mg/L','decimal','measurement','copper','copper',0,0,1.3,'L',0,5,NULL,NULL,2,'Possibly harmful contaminant of concern for many lake uses'),\r\n('dissolved_oxygen','chemical',9,'Dissolved Oxygen (DO)','mg/L','decimal','measurement','dissolved_oxygen','dissolved_oxygen',0,0,20,'H',0,30,NULL,NULL,1,'Determines the water’s ability to support aquatic life, indicating ecosystem health and identifying risks like hypoxia or fish kills.'),\r\n('hardness','chemical',10,'Hardness','mg/L','decimal','features',NULL,'hardness',1,2,300,'M',0,500,NULL,NULL,1,'Reflects the concentration of calcium and magnesium ions, influencing aquatic organisms’ health, water chemistry, and the potential for scale formation.'),\r\n('iron','chemical',11,'Iron','mg/L','decimal','measurement','iron','iron',0,0.1,0.3,'L',0,20,NULL,NULL,2,'Relates to P cycling and has secondary drinking water standard'),\r\n('lead','chemical',12,'Lead','ug/L','decimal','measurement','lead','lead',0,0,10,'L',0,10000,NULL,NULL,1,'Possibly harmful contaminant of concern for many lake uses'),\r\n('manganese','chemical',13,'Manganese','mg/L','decimal','measurement','manganese','manganese',0,0.01,0.05,'L',0,5,NULL,NULL,2,'Relates to P cycling and has secondary drinking water standard'),\r\n('mercury','chemical',14,'Mercury','ug/L','decimal','measurement','mercury','mercury',0,0,2,'L',0,10,NULL,NULL,1,'Possibly harmful contaminant of concern for many lake uses'),\r\n('nitrate_nitrogen','chemical',15,'Nitrate Nitrogen','mg/L','decimal','measurement','nitrate','nitrate',0,0,10,'L',0,100,NULL,NULL,2,'Indicates nutrient loading, contributes to eutrophication, and can harm aquatic life and human health at high concentrations.'),\r\n('ph','chemical',16,'pH','Standard Unit','decimal','measurement','ph','ph',0,5,10,'M',0,14,NULL,NULL,1,'Determines the water’s acidity or alkalinity, affecting aquatic life, nutrient availability, and the toxicity of pollutants.'),\r\n('sulfates','chemical',17,'Sulfates','mg/L','decimal','features',NULL,'sulfates',1,NULL,NULL,'L',0,100,NULL,NULL,1,'High levels can indicate pollution from industrial or agricultural sources, affect water chemistry, and harm aquatic life and drinking water quality.'),\r\n('total_nitrogen','chemical',18,'Total Nitrogen','mg/L','decimal','measurement','total_nitrogen','total_nitrogen',0,0.3,5,'L',0,100,NULL,NULL,2,'Influences algal blooms, water quality, and overall ecosystem balance, helping to identify and mitigate nutrient pollution.'),\r\n('total_phosphorous','chemical',19,'Total Phosphorus','ug/L','decimal','measurement','phosphorous','phosphorous',0,5,500,'L',1,10000,NULL,NULL,1,'A key nutrient driving algal growth and eutrophication, helping to assess and prevent water quality degradation.'),\r\n('unionixed_ammonia','chemical',20,'Un-ionized Ammonia','mg/L','decimal','features',NULL,'unionixed_ammonia',1,0,0.5,'L',0,5,NULL,NULL,3,'Toxic to aquatic life at high concentrations, especially at elevated pH levels, and serves as an indicator of organic pollution and nutrient loading.'),\r\n('zinc','chemical',21,'Zinc','mg/L','decimal','measurement','zinc','zinc',0,0,5,'L',0,15,NULL,NULL,2,'Possibly harmful contaminant of concern for many lake uses'),\r\n('detention_time','hydrological',1,'Detention Time','Days','decimal','features',NULL,'detention_time',1,5,2000,NULL,0,3650,NULL,NULL,1,'Determines how long water and its associated nutrients, pollutants, or sediments remain in the lake, affecting water quality, ecological processes, and the lake’s response to environmental changes.'),\r\n('evaporation','hydrological',2,'Evaporation','Inches / year','decimal','features',NULL,'evaporation',1,10,50,NULL,5,100,NULL,NULL,1,'Affects water levels, salinity, and temperature, influencing aquatic habitats, water availability, and the overall balance of the lake’s ecosystem.'),\r\n('groundwater_interaction','hydrological',3,'Groundwater Interaction','% of inflow','decimal','features',NULL,'groundwater_interaction',1,NULL,NULL,NULL,0,100,NULL,NULL,1,'Influences water levels, temperature, and nutrient exchange, impacting water quality, ecosystem balance, and the lake’s resilience to external stressors like droughts or pollution, including from septic tanks. '),\r\n('precipitation','hydrological',4,'Precipitation','Inches / year','decimal','features',NULL,'precipitation',1,10,100,NULL,2,500,NULL,NULL,1,'Influences water levels, runoff, and the transport of nutrients and pollutants into the lake, directly impacting water quality, ecosystem balance, and flood risk.'),\r\n('runoff_volume_rate','hydrological',5,'Runoff Volume & Rate','% of inflow','decimal','features',NULL,'runoff_volume_rate',1,10,90,'L',0,100,NULL,NULL,1,'Determine the amount of water, nutrients, and pollutants entering the lake, directly impacting water quality, erosion, and the risk of flooding.'),\r\n('inflow','hydrological',6,'Surface Inflow','Cubic feet per second','decimal','features',NULL,'inflow',1,NULL,NULL,NULL,0,1000,NULL,NULL,1,'Determines the supply of water, nutrients, and sediments entering the lake, influencing water quality, ecosystem dynamics, and the balance between water inputs and losses.'),\r\n('water_level_fluctuations','hydrological',7,'Water Level Fluctuations','Max Ft variation / year','decimal','features',NULL,'water_level_fluctuations',1,0,5,'L',0,50,NULL,NULL,1,'Affect shoreline erosion, habitat availability, nutrient cycling, and the balance of aquatic ecosystems, while also influencing human activities like water supply and recreation.'),\r\n('lake_county','overview',3,'County',NULL,'text','metadata',NULL,'lake_county',1,NULL,NULL,NULL,NULL,NULL,NULL,50,NULL,'Primary county in which the lake sits.'),\r\n('lake_lat','overview',4,'Latitude','deg','decimal','metadata',NULL,'lake_lat',1,NULL,NULL,NULL,-180,180,NULL,NULL,6,'Determins climate conditions, such as temperature, precipitation, and seasonal cycles, which influence water temperature, ice cover, and the biological and chemical processes within the lake.'),\r\n('lake_lon','overview',5,'Longitude','deg','decimal','metadata',NULL,'lake_lon',1,NULL,NULL,NULL,-180,180,NULL,NULL,6,NULL),\r\n('lake_name','overview',1,'Name',NULL,'text','metadata',NULL,'lake_name',1,NULL,NULL,NULL,NULL,NULL,NULL,50,NULL,'Name of the lake.'),\r\n('lake_state','overview',2,'State',NULL,'categorical','metadata',NULL,'lake_state',1,NULL,NULL,NULL,NULL,NULL,'AK,AL,AS,AZ,CA,CO,CT,DC,DE,FL,GA,HI,IA,ID,IL,IN,KS,KY,LA,MA,MD,ME,MI,MN,MO,MS,MT,NC,ND,NE,NH,NJ,NM,NV,NY,OH,OK,OR,PA,RI,SC,SD,TN,TX,UT,VA,VT,WA,WI,WV,WY',NULL,NULL,'Primary state in which the lake sits.'),\r\n('average_depth','physical',1,'Average Depth','ft','decimal','features',NULL,'average_depth',1,NULL,NULL,NULL,1,200,NULL,NULL,1,'Influences temperature stratification, oxygen distribution, habitat zones, and the lake’s resilience to pollution and environmental changes.'),\r\n('water_level','physical',2,'Current Water Level','ft','decimal','measurement','water_level','water_level',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'Affects habitat availability, shoreline erosion, nutrient cycling, and the overall balance of the aquatic ecosystem.'),\r\n('lake_elevation_m','physical',3,'Full Pool Elevation','ft','decimal','metadata',NULL,'lake_elevation_m',1,NULL,NULL,NULL,0,10000,NULL,NULL,1,'Important for understanding lake health and safety because it affects atmospheric pressure, temperature, and dissolved oxygen levels, influencing aquatic ecosystems and water quality.'),\r\n('ice_cover','physical',4,'Ice Cover','Y/N','categorical','features',NULL,'ice_cover',1,NULL,NULL,NULL,NULL,NULL,'Y,N',NULL,1,'Influences oxygen levels, nutrient cycling, and the survival of aquatic organisms during colder months.'),\r\n('ice_freeze_date','physical',5,'Ice Freeze Date','Average date','date','features',NULL,'ice_freeze_date',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Reflects climate patterns, affects ice-related activities, and influences biological processes, such as fish spawning and oxygen dynamics.'),\r\n('ice_thaw_date','physical',6,'Ice Thaw Date','Average date','date','features',NULL,'ice_thaw_date',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'Reflects climate patterns, affects ice-related activities, and influences biological processes, such as fish spawning and oxygen dynamics.'),\r\n('lake_waterarea_acres','physical',7,'Lake Size ','acres','decimal','metadata',NULL,'lake_waterarea_acres',1,NULL,NULL,NULL,1,100000,NULL,NULL,1,'Influences water volume, habitat diversity, nutrient dynamics, and the lake’s susceptibility to external impacts like pollution or climate change.'),\r\n('land_use_urban_agriculture','physical',8,'Land Use - Urban/ Agriculture','% of watershed','decimal','features',NULL,'land_use_urban_agriculture',1,2,75,'L',0,100,NULL,NULL,1,'Influences nutrient runoff, sedimentation, and pollution levels, making it essential to consider for effective water quality management and ecosystem protection.'),\r\n('max_surface_temp','physical',9,'Max Surface Temp','deg F','decimal','features',NULL,'max_surface_temp',1,40,95,'L',0,100,NULL,NULL,1,'Reveals the effects of climate change, influences stratification, impacts dissolved oxygen levels, and affects the habitat suitability for aquatic life.'),\r\n('maximum_depth','physical',10,'Maximum Depth','ft','decimal','features',NULL,'maximum_depth',1,NULL,NULL,NULL,3,3000,NULL,NULL,1,'Influences temperature stratification, oxygen distribution, habitat zones, and the lake’s resilience to pollution and environmental changes.'),\r\n('sediment_composition','physical',11,'Sediment Composition','% of bottom covered by organic sediment','decimal','features',NULL,'sediment_composition',1,10,90,'L',0,100,NULL,NULL,1,'Reveals the sources of pollution, nutrient levels, and potential contaminants, influencing water quality, ecosystem dynamics, and habitat conditions.'),\r\n('transparency','physical',12,'Transparency','ft','decimal','measurement','secchi_disk_depth','secchi_disk_depth',0,1,50,'H',0,100,NULL,NULL,1,'Reflects water clarity, which impacts aquatic life, photosynthesis, and indicates potential issues like algal blooms or sediment pollution.'),\r\n('turbidity','physical',13,'Turbidity','NTU','decimal','measurement','turbidity','turbidity',0,0.5,100,'L',0.1,1000,NULL,NULL,1,'Indicates the concentration of suspended particles, affecting water clarity, light penetration, photosynthesis, and the overall health of aquatic ecosystems.'),\r\n('pct_agricultural','watershed',1,'% Agricultural','%','decimal','features',NULL,'pct_agricultural',1,NULL,NULL,NULL,0,100,NULL,NULL,1,NULL),\r\n('pct_forest','watershed',2,'% Forest','%','decimal','features',NULL,'pct_forest',1,NULL,NULL,NULL,0,100,NULL,NULL,1,NULL),\r\n('pct_grasslands','watershed',3,'% Grasslands','%','decimal','features',NULL,'pct_grasslands',1,NULL,NULL,NULL,0,100,NULL,NULL,1,NULL),\r\n('pct_openwater','watershed',4,'% Openwater','%','decimal','features',NULL,'pct_openwater',1,NULL,NULL,NULL,0,100,NULL,NULL,1,NULL),\r\n('pct_urban','watershed',5,'% Urban','%','decimal','features',NULL,'pct_urban',1,NULL,NULL,NULL,0,100,NULL,NULL,1,NULL),\r\n('pct_wetlands','watershed',6,'% Wetlands','%','decimal','features',NULL,'pct_wetlands',1,NULL,NULL,NULL,0,100,NULL,NULL,1,NULL),\r\n('impervious_surface_coverage','watershed',7,'Impervious Surface Coverage','%','decimal','features',NULL,'impervious_surface_coverage',1,2,50,'L',0,100,NULL,NULL,1,'Increases runoff, reduces groundwater recharge, and transports pollutants like nutrients, sediments, and chemicals into the lake, negatively affecting water quality and ecosystem health.'),\r\n('land_vegetative_cover','watershed',8,'Land Vegetative Cover','Low, Medium, High','categorical','features',NULL,'land_vegetative_cover',1,NULL,NULL,'H',NULL,NULL,'Low,Medium,High',NULL,NULL,'Reduces erosion, filters pollutants, regulates runoff, and provides habitat for wildlife, contributing to the overall stability and quality of the lake ecosystem.'),\r\n('livestock_density','watershed',9,'Livestock Density','1000 lb weight/acre','decimal','features',NULL,'livestock_density',1,NULL,NULL,NULL,0,1000000,NULL,NULL,1,NULL),\r\n('nonpoint_source_pollution','watershed',10,'NonPoint Source Pollution','% of input for specified contaminant','decimal','features',NULL,'nonpoint_source_pollution',1,10,90,'L',0,100,NULL,NULL,1,'Involves diffuse runoff from sources like agriculture, urban areas, and roads, which can carry nutrients, sediments, and toxins into the lake, degrading water quality and ecosystems.'),\r\n('nutrient_loading','watershed',11,'Nutrient Loading','g (TN+P)/m2 of watershed/yr','decimal','features',NULL,'nutrient_loading',1,0.1,5,'L',0,100,NULL,NULL,2,'Excessive nutrients, such as nitrogen and phosphorus, can drive algal blooms, deplete oxygen levels, and disrupt aquatic ecosystems, leading to poor water quality and potential health risks.'),\r\n('point_source_pollution','watershed',12,'Point Source Pollution','# discharges','integer','features',NULL,'point_source_pollution',1,NULL,NULL,'L',0,1000,NULL,NULL,1,'Direct discharges of pollutants from identifiable sources, such as industrial outfalls or wastewater treatment plants, which can degrade water quality and harm aquatic life.'),\r\n('sediment_load','watershed',13,'Sediment Load','lb/acre of watershed/yr','decimal','features',NULL,'sediment_load',1,20,100000,'L',10,1000000,NULL,NULL,1,'Excessive sediment can reduce water clarity, smother aquatic habitats, transport pollutants, and alter nutrient dynamics, negatively affecting the lake ecosystem.'),\r\n('septic_count','watershed',14,'Septic Count','#','integer','features',NULL,'septic_count',1,NULL,NULL,NULL,0,100000,NULL,NULL,0,NULL),\r\n('shoreline_erosion','watershed',15,'Shoreline Erosion','% of shoreline with erosion evidence','decimal','features',NULL,'shoreline_erosion',1,1,50,'L',0,100,NULL,NULL,1,'Contributes to sedimentation, habitat loss, and nutrient loading, impacting water quality, aquatic ecosystems, and the stability of surrounding land.'),\r\n('soil_type_erodibility','watershed',16,'Soil Type & Erodibillity','Low, Medium, High','categorical','features',NULL,'soil_type_erodibility',1,NULL,NULL,'L',NULL,NULL,'Low,Medium,High',NULL,NULL,'Influence the amount of sediment, nutrients, and pollutants entering the lake through runoff, affecting water quality and ecosystem stability.'),\r\n('watershed_area','watershed',17,'Watershed Area','Sq. mi','decimal','features',NULL,'watershed_area',1,0.1,100,NULL,0,10000,NULL,NULL,1,'Determines the volume of water, sediment, and nutrients flowing into the lake, influencing its water quality, ecological dynamics, and susceptibility to pollution.'),\r\n('watershed_to_lake_area_ratio','watershed',18,'Watershed to Lake Area Ratio','Ratio','decimal','features',NULL,'watershed_to_lake_area_ratio',1,1,1000,'M',0,10000,NULL,NULL,1,'Determines level of influence of watershed in any given season or year, likely detention time, flushing rate, and other hydrologic features')\r\n;\r\n";

                string query = @"
            SELECT CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = @TableName
                ) 
                THEN 1 
                ELSE 0 
            END"
                ;

                bool exists = await connection.ExecuteScalarAsync<bool>(query, new { TableName = "features" });
                if (exists)
                {
                    await connection.ExecuteAsync(insertQuery);
                }
                else
                {
                    await connection.ExecuteAsync(createTableQuery);
                    await connection.ExecuteAsync(insertQuery);
                }

            }
        }
        private async Task ToolboxVendorsTableCreationSeedDataAsync()
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();
                string createTableQuery = @"create table if not exists toolbox_vendors ( vendor_id varchar(10), vendor_name varchar(100) );";
                string insertQuery = "truncate table toolbox_vendors;\r\ninsert into toolbox_vendors values ('crod', 'Crodeon'),('aqua','AquaRealTime'),('simp','Simple Labs');\r\n";


                string query = @"
            SELECT CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = @TableName
                ) 
                THEN 1 
                ELSE 0 
            END"
                ;

                bool exists = await connection.ExecuteScalarAsync<bool>(query, new { TableName = "toolbox_vendors" });
                if (exists)
                {
                    await connection.ExecuteAsync(insertQuery);
                }
                else
                {
                    await connection.ExecuteAsync(createTableQuery);
                    await connection.ExecuteAsync(insertQuery);
                }

            }
        }
        private async Task ToolboxDeviceTypeTableCreationSeedDataAsync()
        {
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();
            string createTableQuery = @"    create table if not exists toolbox_device_types (
                                            vendor_id varchar(10),
                                            vendor_product_name varchar(100),
                                            vendor_product_id varchar(100),
                                            item_label varchar(100),
                                            item_sku varchar(50),
                                            api_type varchar(10), 
                                            registration_title_text text,
                                            registration_id_label text,
                                            registration_id_help_text text,
                                            registration_id_placeholder text,
                                            registration_id_regex text, 
                                            registration_location_help_text text);";

            /*'onetime','ongoing','none'*/
            string insertQuery = "truncate table toolbox_device_types;\r\ninsert into toolbox_device_types values\r\n('simp', 'Surface Water Test - 6A', 'DFCA5F5F-0001', 'Lake Vitals Test', 'LP101', 'onetime', 'Lake Vitals Test', 'Test ID', 'Enter the 6 character Test ID',\r\n'Enter Test ID Here', '', 'Select the location on the lake where the sample has been, or will be, taken.'),\r\n('tempest', 'Tempest Weather System', '#109165', 'Weather Station', 'LP201', 'ongoing', 'Weather Station', 'Serial No.', 'Enter the Station Serial No.',\r\n'Enter Serial No. Here', '', 'Select the location on the lake where the station will be placed.'),\r\n('manhole', 'ManholeMonitor', 'XXXXXX', 'Lake Level', 'LP202', 'ongoing', 'Lake Level Monitor', 'Device ID', 'Enter the 6 character Device ID',\r\n'Enter Device ID Here', '', 'Select the location on the lake where the level monitor will be placed.'),\r\n('aqua', 'Algae Tracker', 'XXXXXX', 'AlgaeTracker Buoy', 'LP001', 'ongoing', 'AlgaeTracker Buoy', 'Device ID', 'Enter the Device ID',\r\n'Enter Device ID Here', '', 'Select the location on the lake where the buoy will be placed.')\r\n;\r\n";

            string query = @"
            SELECT CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = @TableName
                ) 
                THEN 1 
                ELSE 0 
            END"
            ;

            bool exists = await connection.ExecuteScalarAsync<bool>(query, new { TableName = "toolbox_device_types" });
            if (exists)
            {
                await connection.ExecuteAsync(insertQuery);
            }
            else
            {
                await connection.ExecuteAsync(createTableQuery);
                await connection.ExecuteAsync(insertQuery);
            }

        }
        private async Task ToolboxPurchasesTableCreationSeedDataAsync()
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();
                string createTableQuery = @"create table if not exists toolbox_purchases (
                            lp_trans_no serial primary key,
                            vendor_trans_id varchar(100),
                            vendor_id varchar(10),
                            purchase_datetime timestamp with time zone, 
                            item_sku varchar(100), 
                            item_label varchar(200),
                            user_email varchar(100), 
                            price numeric(12,2),
                            status varchar(20),
                            registration_datetime timestamp with time zone, 
                            vendor_device_id varchar(100), 
                            location_id varchar(100),
                            lakepulse_id integer,
                            api_key text DEFAULT '',
                            last_data_collected timestamp
                            );";
                /* status = 'purchased','registered','inactive' */

                string insertQuery = "truncate table toolbox_purchases;\r\ninsert into toolbox_purchases (lakepulse_id,item_sku,vendor_device_id,vendor_id,location_id,api_key,status) values\r\n(482341,'LP203','61e96dfbeef69a001871ef77','aqua','c1234','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI2MGM0NGU2ZjUxNmMwYzFiOTJkZThlNWUiLCJhY2NvdW50Ijp7Il9pZCI6IjYwYzQ0MjIyNTE2YzBjMWI5MmRlOGU1YiJ9LCJjdXN0b21Mb2dvIjpmYWxzZSwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDAwNzk0MjcsImV4cCI6MTc3MTYxNTQyN30.JHrrssvJL2itFUI4KtNsnhkSqz2iZ11JvSqA7GmkXfM','registered'),\r\n(4309,'LP203','','aqua','Merrybrook','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI2NmM1OGRkYTViNzQyOWY5MDk1MzY3ZGYiLCJhY2NvdW50Ijp7Il9pZCI6IjY2YzU4ZGRhNWI3NDI5ZjkwOTUzNjdkZCJ9LCJjdXN0b21Mb2dvIjpmYWxzZSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQyNTY2ODcyLCJleHAiOjE3NzQxMDI4NzJ9.et1AwZ0YomLhlZ8gyHjDtNMMxiLIo8iDKZMfei3C14Q','registered')\r\n;\r\n";


                string query = @"
            SELECT CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = @TableName
                ) 
                THEN 1 
                ELSE 0 
            END"
                ;
                int recordCount = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM toolbox_purchases");
                bool exists = await connection.ExecuteScalarAsync<bool>(query, new { TableName = "toolbox_purchases" });
                if (exists)
                {
                    if (recordCount == 0)
                    {
                        await connection.ExecuteAsync(insertQuery);
                    }
                }
                else
                {
                    await connection.ExecuteAsync(createTableQuery);
                    await connection.ExecuteAsync(insertQuery);
                }

            }
        }
        private async Task AlertLevelSeedDataAsync()
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();
                string insertQuery = "insert into \"AlertLevels\" values\r\n(0, 'Notification', '#00ff00'),\r\n(1, 'Minor Alert', '#FFFF00'),\r\n(2, 'Medium Alert', '#FFA500'),\r\n(3, 'Critical Alert', '#FF0000')\r\n;";

                string query = @"
            SELECT CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = @TableName
                ) 
                THEN 1 
                ELSE 0 
            END";                
                bool exists = await connection.ExecuteScalarAsync<bool>(query, new { TableName = "AlertLevels" });
                if (exists)
                {
                    int recordCount = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM \"AlertLevels\"");
                    if (recordCount == 0)
                    {
                        await connection.ExecuteAsync(insertQuery);
                    }
                }               
            }
        }
        private async Task AlertCategorieSeedDataAsync()
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();
                string insertQuery = "truncate table \"AlertCategories\"; insert into \"AlertCategories\" values\r\n(0, 'Water Quality Alert', '', 1),\r\n(1, 'New Data Source Available', '', 0),\r\n(2, 'Data Library Refreshed', '', 0),\r\n(3, 'Field Note Added', '', 0),\r\n(4, 'Beach and Swimming Alert', '', 1),\r\n(5, 'General Notification', '', 0),\r\n(6, 'Portal Update', '', 0)\r\n;\r\n";

                string query = @"
            SELECT CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = @TableName
                ) 
                THEN 1 
                ELSE 0 
            END";
                
                bool exists = await connection.ExecuteScalarAsync<bool>(query, new { TableName = "AlertCategories" });
                if (exists)
                {
                    int recordCount = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM \"AlertCategories\"");
                    if (recordCount == 0)
                    {
                        await connection.ExecuteAsync(insertQuery);
                    }
                }
            }
        }
    }
}
