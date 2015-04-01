
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, 2012 and Azure
-- --------------------------------------------------
-- Date Created: 03/30/2015 13:29:00
-- Generated from EDMX file: C:\Users\Jeffrey\Documents\Programming\NEST\NEST-App\Models\VehicleModel.edmx
-- --------------------------------------------------

SET QUOTED_IDENTIFIER OFF;
GO
USE [NEST_DB];
GO
IF SCHEMA_ID(N'dbo') IS NULL EXECUTE(N'CREATE SCHEMA [dbo]');
GO

-- --------------------------------------------------
-- Dropping existing FOREIGN KEY constraints
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[FK_VehicleConfiguration]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[UAVs] DROP CONSTRAINT [FK_VehicleConfiguration];
GO
IF OBJECT_ID(N'[dbo].[FK_ConfigurationEquipmentList]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Equipments] DROP CONSTRAINT [FK_ConfigurationEquipmentList];
GO
IF OBJECT_ID(N'[dbo].[FK_EuipmentHealthEquipmentList]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[EquipmentHealths] DROP CONSTRAINT [FK_EuipmentHealthEquipmentList];
GO
IF OBJECT_ID(N'[dbo].[FK_VehicleEuipmentHealth]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[EquipmentHealths] DROP CONSTRAINT [FK_VehicleEuipmentHealth];
GO
IF OBJECT_ID(N'[dbo].[FK_UAVFlightState]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[FlightStates] DROP CONSTRAINT [FK_UAVFlightState];
GO
IF OBJECT_ID(N'[dbo].[FK_UAVSchedule]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Schedules] DROP CONSTRAINT [FK_UAVSchedule];
GO
IF OBJECT_ID(N'[dbo].[FK_MissionOrder]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Orders] DROP CONSTRAINT [FK_MissionOrder];
GO
IF OBJECT_ID(N'[dbo].[FK_MissionSchedule]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Missions] DROP CONSTRAINT [FK_MissionSchedule];
GO
IF OBJECT_ID(N'[dbo].[FK_MaintenanceSchedule]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Maintenances] DROP CONSTRAINT [FK_MaintenanceSchedule];
GO
IF OBJECT_ID(N'[dbo].[FK_MissionMissionLog]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[MissionLogs] DROP CONSTRAINT [FK_MissionMissionLog];
GO
IF OBJECT_ID(N'[dbo].[FK_MissionLogMissionLogActivity]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[MissionLogActivities] DROP CONSTRAINT [FK_MissionLogMissionLogActivity];
GO
IF OBJECT_ID(N'[dbo].[FK_UserUserRole]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Users] DROP CONSTRAINT [FK_UserUserRole];
GO
IF OBJECT_ID(N'[dbo].[FK_WaypointWaypoint]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Waypoints] DROP CONSTRAINT [FK_WaypointWaypoint];
GO
IF OBJECT_ID(N'[dbo].[FK_WaypointMission]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Waypoints] DROP CONSTRAINT [FK_WaypointMission];
GO
IF OBJECT_ID(N'[dbo].[FK_UAVEventLog]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[EventLogs] DROP CONSTRAINT [FK_UAVEventLog];
GO
IF OBJECT_ID(N'[dbo].[FK_UserUAV]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[UAVs] DROP CONSTRAINT [FK_UserUAV];
GO
IF OBJECT_ID(N'[dbo].[FK_CMD_NAV_Hover_inherits_CMD_NAV_Waypoint]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[CMD_NAV_Waypoint_CMD_NAV_Hover] DROP CONSTRAINT [FK_CMD_NAV_Hover_inherits_CMD_NAV_Waypoint];
GO
IF OBJECT_ID(N'[dbo].[FK_CMD_DO_Return_To_Base_inherits_CMD_NAV_Set_Base]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[CMD_NAV_Set_Base_CMD_DO_Return_To_Base] DROP CONSTRAINT [FK_CMD_DO_Return_To_Base_inherits_CMD_NAV_Set_Base];
GO
IF OBJECT_ID(N'[dbo].[FK_CMD_DO_Change_Speed_inherits_CMD_NAV_Takeoff]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[CMD_NAV_Takeoff_CMD_DO_Change_Speed] DROP CONSTRAINT [FK_CMD_DO_Change_Speed_inherits_CMD_NAV_Takeoff];
GO
IF OBJECT_ID(N'[dbo].[FK_Weather_inherits_MapRestricted]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[MapRestrictedSet_Weather] DROP CONSTRAINT [FK_Weather_inherits_MapRestricted];
GO

-- --------------------------------------------------
-- Dropping existing tables
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[UAVs]', 'U') IS NOT NULL
    DROP TABLE [dbo].[UAVs];
GO
IF OBJECT_ID(N'[dbo].[FlightStates]', 'U') IS NOT NULL
    DROP TABLE [dbo].[FlightStates];
GO
IF OBJECT_ID(N'[dbo].[Configurations]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Configurations];
GO
IF OBJECT_ID(N'[dbo].[Equipments]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Equipments];
GO
IF OBJECT_ID(N'[dbo].[EquipmentHealths]', 'U') IS NOT NULL
    DROP TABLE [dbo].[EquipmentHealths];
GO
IF OBJECT_ID(N'[dbo].[NonownshipVehicles]', 'U') IS NOT NULL
    DROP TABLE [dbo].[NonownshipVehicles];
GO
IF OBJECT_ID(N'[dbo].[Schedules]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Schedules];
GO
IF OBJECT_ID(N'[dbo].[Orders]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Orders];
GO
IF OBJECT_ID(N'[dbo].[Missions]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Missions];
GO
IF OBJECT_ID(N'[dbo].[Maintenances]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Maintenances];
GO
IF OBJECT_ID(N'[dbo].[MissionLogs]', 'U') IS NOT NULL
    DROP TABLE [dbo].[MissionLogs];
GO
IF OBJECT_ID(N'[dbo].[MissionLogActivities]', 'U') IS NOT NULL
    DROP TABLE [dbo].[MissionLogActivities];
GO
IF OBJECT_ID(N'[dbo].[Users]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Users];
GO
IF OBJECT_ID(N'[dbo].[UserRoles]', 'U') IS NOT NULL
    DROP TABLE [dbo].[UserRoles];
GO
IF OBJECT_ID(N'[dbo].[CMD_NAV_Waypoint]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CMD_NAV_Waypoint];
GO
IF OBJECT_ID(N'[dbo].[CMD_NAV_Takeoff]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CMD_NAV_Takeoff];
GO
IF OBJECT_ID(N'[dbo].[CMD_CONDITION_Rates]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CMD_CONDITION_Rates];
GO
IF OBJECT_ID(N'[dbo].[CMD_NAV_Target]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CMD_NAV_Target];
GO
IF OBJECT_ID(N'[dbo].[CMD_NAV_Set_Base]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CMD_NAV_Set_Base];
GO
IF OBJECT_ID(N'[dbo].[CMD_NAV_Land]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CMD_NAV_Land];
GO
IF OBJECT_ID(N'[dbo].[CMD_ACK]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CMD_ACK];
GO
IF OBJECT_ID(N'[dbo].[Waypoints]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Waypoints];
GO
IF OBJECT_ID(N'[dbo].[EventLogs]', 'U') IS NOT NULL
    DROP TABLE [dbo].[EventLogs];
GO
IF OBJECT_ID(N'[dbo].[MapAreaSet]', 'U') IS NOT NULL
    DROP TABLE [dbo].[MapAreaSet];
GO
IF OBJECT_ID(N'[dbo].[MapRestrictedSet]', 'U') IS NOT NULL
    DROP TABLE [dbo].[MapRestrictedSet];
GO
IF OBJECT_ID(N'[dbo].[MapPointSet]', 'U') IS NOT NULL
    DROP TABLE [dbo].[MapPointSet];
GO
IF OBJECT_ID(N'[dbo].[CMD_NAV_Return]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CMD_NAV_Return];
GO
IF OBJECT_ID(N'[dbo].[CMD_NAV_Hold]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CMD_NAV_Hold];
GO
IF OBJECT_ID(N'[dbo].[CMD_NAV_Adjust]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CMD_NAV_Adjust];
GO
IF OBJECT_ID(N'[dbo].[CMD_NAV_Waypoint_CMD_NAV_Hover]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CMD_NAV_Waypoint_CMD_NAV_Hover];
GO
IF OBJECT_ID(N'[dbo].[CMD_NAV_Set_Base_CMD_DO_Return_To_Base]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CMD_NAV_Set_Base_CMD_DO_Return_To_Base];
GO
IF OBJECT_ID(N'[dbo].[CMD_NAV_Takeoff_CMD_DO_Change_Speed]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CMD_NAV_Takeoff_CMD_DO_Change_Speed];
GO
IF OBJECT_ID(N'[dbo].[MapRestrictedSet_Weather]', 'U') IS NOT NULL
    DROP TABLE [dbo].[MapRestrictedSet_Weather];
GO

-- --------------------------------------------------
-- Creating all tables
-- --------------------------------------------------

-- Creating table 'UAVs'
CREATE TABLE [dbo].[UAVs] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Callsign] nvarchar(max)  NOT NULL,
    [NumDeliveries] int  NOT NULL,
    [Mileage] int  NOT NULL,
    [create_date] datetime  NOT NULL,
    [modified_date] datetime  NOT NULL,
    [MaxVelocity] float  NOT NULL,
    [MaxAcceleration] float  NOT NULL,
    [MaxVerticalVelocity] float  NOT NULL,
    [UpdateRate] float  NOT NULL,
    [CruiseAltitude] float  NOT NULL,
    [MinDeliveryAlt] float  NOT NULL,
    [User_user_id] int  NULL,
    [isActive] bit  NOT NULL,
    [estimated_workload] int  NOT NULL,
    [Configurations_Id] int  NOT NULL
);
GO

-- Creating table 'FlightStates'
CREATE TABLE [dbo].[FlightStates] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Timestamp] datetime  NOT NULL,
    [VelocityX] float  NOT NULL,
    [VelocityY] float  NOT NULL,
    [VelocityZ] float  NOT NULL,
    [Yaw] float  NOT NULL,
    [Roll] float  NOT NULL,
    [Pitch] float  NOT NULL,
    [YawRate] float  NOT NULL,
    [RollRate] float  NOT NULL,
    [PitchRate] float  NOT NULL,
    [BatteryLevel] float  NOT NULL,
    [UAVId] int  NOT NULL,
    [create_date] datetime  NOT NULL,
    [modified_date] datetime  NOT NULL,
    [Latitude] float  NOT NULL,
    [Longitude] float  NOT NULL,
    [Altitude] float  NOT NULL
);
GO

-- Creating table 'Configurations'
CREATE TABLE [dbo].[Configurations] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Name] nvarchar(max)  NOT NULL,
    [Classification] nvarchar(max)  NOT NULL,
    [NumberOfMotors] int  NOT NULL,
    [create_date] datetime  NOT NULL,
    [modified_date] datetime  NOT NULL
);
GO

-- Creating table 'Equipments'
CREATE TABLE [dbo].[Equipments] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Type] int  NOT NULL,
    [Name] nvarchar(max)  NOT NULL,
    [Vendor] nvarchar(max)  NOT NULL,
    [Manufacturer] nvarchar(max)  NOT NULL,
    [Price] decimal(18,0)  NOT NULL,
    [Weight] float  NOT NULL,
    [Description] nvarchar(max)  NOT NULL,
    [create_date] datetime  NOT NULL,
    [modified_date] datetime  NOT NULL,
    [Configuration_Id] int  NOT NULL
);
GO

-- Creating table 'EquipmentHealths'
CREATE TABLE [dbo].[EquipmentHealths] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Health] float  NOT NULL,
    [LastMaintenance] nvarchar(max)  NOT NULL,
    [DateReceived] datetime  NOT NULL,
    [create_date] datetime  NOT NULL,
    [modified_date] datetime  NOT NULL,
    [EquipmentList_Id] int  NOT NULL,
    [Vehicle_Id] int  NOT NULL
);
GO

-- Creating table 'NonownshipVehicles'
CREATE TABLE [dbo].[NonownshipVehicles] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Position] geography  NOT NULL,
    [Velocity] float  NOT NULL,
    [VelocityX] float  NOT NULL,
    [VelocityY] float  NOT NULL,
    [VelocityZ] float  NOT NULL,
    [Yaw] float  NOT NULL,
    [FlightPlan] nvarchar(max)  NOT NULL
);
GO

-- Creating table 'Schedules'
CREATE TABLE [dbo].[Schedules] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [UAVId] int  NULL,
    [create_date] datetime  NOT NULL,
    [modified_date] datetime  NOT NULL,
    [CurrentMission] int  NULL
);
GO

-- Creating table 'Orders'
CREATE TABLE [dbo].[Orders] (
    [Id] int  NOT NULL,
    [TimeReceived] datetime  NOT NULL,
    [TimeCompleted] datetime  NOT NULL,
    [PackageContents] nvarchar(max)  NOT NULL,
    [Notes] nvarchar(max)  NULL,
    [DestinationAddress] nvarchar(max)  NOT NULL,
    [Mission_id] int  NOT NULL,
    [create_date] datetime  NOT NULL,
    [modified_date] datetime  NOT NULL
);
GO

-- Creating table 'Missions'
CREATE TABLE [dbo].[Missions] (
    [Phase] varchar(50)  NULL,
    [FlightPattern] varchar(50)  NULL,
    [Payload] varchar(max)  NULL,
    [Priority] int  NOT NULL,
    [FinancialCost] decimal(19,4)  NULL,
    [TimeAssigned] datetime  NULL,
    [TimeCompleted] datetime  NULL,
    [ScheduledCompletionTime] datetime  NULL,
    [EstimatedCompletionTime] datetime  NULL,
    [id] int IDENTITY(1,1) NOT NULL,
    [ScheduleId] int  NULL,
    [create_date] datetime  NULL,
    [modified_date] datetime  NULL,
    [Latitude] float  NOT NULL,
    [Longitude] float  NOT NULL
);
GO

-- Creating table 'Maintenances'
CREATE TABLE [dbo].[Maintenances] (
    [last_maintenance] datetime  NOT NULL,
    [next_maintenance] datetime  NOT NULL,
    [time_remaining] nvarchar(max)  NOT NULL,
    [id] int IDENTITY(1,1) NOT NULL,
    [ScheduleId] int  NOT NULL,
    [create_date] datetime  NOT NULL,
    [modified_date] datetime  NOT NULL
);
GO

-- Creating table 'MissionLogs'
CREATE TABLE [dbo].[MissionLogs] (
    [id] int IDENTITY(1,1) NOT NULL,
    [Mission_id] int  NOT NULL,
    [create_date] datetime  NOT NULL,
    [modified_date] datetime  NOT NULL
);
GO

-- Creating table 'MissionLogActivities'
CREATE TABLE [dbo].[MissionLogActivities] (
    [id] int IDENTITY(1,1) NOT NULL,
    [MissionLog_id] int  NOT NULL,
    [action_taken] nvarchar(max)  NOT NULL,
    [create_date] datetime  NOT NULL,
    [modified_date] datetime  NOT NULL,
    [action_user_id] nvarchar(max)  NOT NULL
);
GO

-- Creating table 'Users'
CREATE TABLE [dbo].[Users] (
    [user_id] int IDENTITY(1,1) NOT NULL,
    [username] nvarchar(max)  NOT NULL,
    [password] nvarchar(max)  NOT NULL,
    [create_date] datetime  NOT NULL,
    [modified_date] datetime  NOT NULL,
    [phone_number] nvarchar(max)  NOT NULL,
    [position_in_queue] int  NULL,
    [current_workload] int  NOT NULL,
    [UserRole_Id] int  NOT NULL
);
GO

-- Creating table 'UserRoles'
CREATE TABLE [dbo].[UserRoles] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [role_type] nvarchar(max)  NOT NULL,
    [access_level] nvarchar(max)  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Waypoint'
CREATE TABLE [dbo].[CMD_NAV_Waypoint] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Altitude] nvarchar(max)  NOT NULL,
    [Latitude] nvarchar(max)  NOT NULL,
    [Longitude] nvarchar(max)  NOT NULL,
    [UAVId] int  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Takeoff'
CREATE TABLE [dbo].[CMD_NAV_Takeoff] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [TakeoffPitch] nvarchar(max)  NOT NULL,
    [Altitude] nvarchar(max)  NOT NULL,
    [UAVId] int  NOT NULL,
    [Acceleration] float  NOT NULL
);
GO

-- Creating table 'CMD_CONDITION_Rates'
CREATE TABLE [dbo].[CMD_CONDITION_Rates] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [AltitudeUpdateRate] nvarchar(max)  NOT NULL,
    [ThrottleUpdateRate] nvarchar(max)  NOT NULL,
    [LatitudeUpdateRate] nvarchar(max)  NOT NULL,
    [RollUpdateRate] nvarchar(max)  NOT NULL,
    [PitchUpdateRate] nvarchar(max)  NOT NULL,
    [YawUpdateRate] nvarchar(max)  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Target'
CREATE TABLE [dbo].[CMD_NAV_Target] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Altitude] float  NOT NULL,
    [Latitude] float  NOT NULL,
    [Longitude] float  NOT NULL,
    [UAVId] int  NOT NULL,
    [Acked] bit  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Set_Base'
CREATE TABLE [dbo].[CMD_NAV_Set_Base] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Latitude] nvarchar(max)  NOT NULL,
    [Longitude] nvarchar(max)  NOT NULL,
    [UAVId] int  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Land'
CREATE TABLE [dbo].[CMD_NAV_Land] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Altitude] float  NOT NULL,
    [Latitude] float  NOT NULL,
    [Longitude] float  NOT NULL,
    [Throttle] float  NOT NULL,
    [UAVId] int  NOT NULL,
    [Acked] bit  NOT NULL
);
GO

-- Creating table 'CMD_ACK'
CREATE TABLE [dbo].[CMD_ACK] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [CommandId] int  NOT NULL,
    [Reason] nvarchar(max)  NOT NULL,
    [CommandType] nvarchar(max)  NOT NULL,
    [Accepted] bit  NOT NULL
);
GO

-- Creating table 'Waypoints'
CREATE TABLE [dbo].[Waypoints] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [WaypointName] nvarchar(max)  NOT NULL,
    [NextWaypointId] int  NULL,
    [WasSkipped] bit  NOT NULL,
    [TimeCompleted] datetime  NULL,
    [Action] nvarchar(max)  NOT NULL,
    [GeneratedBy] nvarchar(max)  NOT NULL,
    [MissionId] int  NULL,
    [IsActive] bit  NOT NULL,
    [Longitude] float  NOT NULL,
    [Latitude] float  NOT NULL,
    [Altitude] float  NOT NULL
);
GO

-- Creating table 'EventLogs'
CREATE TABLE [dbo].[EventLogs] (
    [event_id] int IDENTITY(1,1) NOT NULL,
    [create_date] datetime  NOT NULL,
    [modified_date] datetime  NOT NULL,
    [uav_id] int  NOT NULL,
    [message] nvarchar(max)  NOT NULL,
    [criticality] nvarchar(max)  NOT NULL,
    [uav_callsign] nvarchar(max)  NOT NULL,
    [operator_screen_name] nvarchar(max)  NOT NULL,
    [UAVId] int  NOT NULL
);
GO

-- Creating table 'MapAreaSet'
CREATE TABLE [dbo].[MapAreaSet] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [MultiPoint_coordinates] geography  NOT NULL,
    [MultiPoint_name] nvarchar(max)  NOT NULL,
    [PopulationDensity] float  NOT NULL,
    [SeaLevel] float  NOT NULL,
    [SafeLandingLocation] nvarchar(max)  NOT NULL,
    [NonOwnShipAircraftPath] nvarchar(max)  NOT NULL,
    [Time_created] datetime  NOT NULL,
    [Creator_created] nvarchar(max)  NOT NULL,
    [Warning] bit  NOT NULL
);
GO

-- Creating table 'MapRestrictedSet'
CREATE TABLE [dbo].[MapRestrictedSet] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [NorthEastLatitude] float  NOT NULL,
    [NorthEastLongitude] float  NOT NULL,
    [SouthWestLatitude] float  NOT NULL,
    [SouthWestLongitude] float  NOT NULL,
    [Ceiling] float  NOT NULL,
    [Creator] nvarchar(max)  NOT NULL,
    [TimeCreated] datetime  NOT NULL,
    [TimeEnds] datetime  NOT NULL,
    [ReasonCreated] nvarchar(max)  NOT NULL,
    [Warning] bit  NOT NULL
);
GO

-- Creating table 'MapPointSet'
CREATE TABLE [dbo].[MapPointSet] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Point_coordinates] geography  NOT NULL,
    [Point_name] nvarchar(max)  NOT NULL,
    [PopulationDensity] float  NOT NULL,
    [SeaLevel] float  NOT NULL,
    [SafeLandingLocation] nvarchar(max)  NOT NULL,
    [NonOwnShipAircraftPath] nvarchar(max)  NOT NULL,
    [Time_created] datetime  NOT NULL,
    [Creator_created] nvarchar(max)  NOT NULL,
    [Warning] bit  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Return'
CREATE TABLE [dbo].[CMD_NAV_Return] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Altitude] float  NOT NULL,
    [Latitude] float  NOT NULL,
    [Longitude] float  NOT NULL,
    [Throttle] float  NOT NULL,
    [UAVId] int  NOT NULL,
    [Acked] bit  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Hold'
CREATE TABLE [dbo].[CMD_NAV_Hold] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Altitude] float  NOT NULL,
    [Latitude] float  NOT NULL,
    [Longitude] float  NOT NULL,
    [UAVId] int  NOT NULL,
    [Time] float  NOT NULL,
    [Acked] bit  NOT NULL,
    [Throttle] float  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Adjust'
CREATE TABLE [dbo].[CMD_NAV_Adjust] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Altitude] float  NOT NULL,
    [Latitude] float  NOT NULL,
    [Longitude] float  NOT NULL,
    [Throttle] float  NOT NULL,
    [UAVId] int  NOT NULL,
    [Acked] bit  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Waypoint_CMD_NAV_Hover'
CREATE TABLE [dbo].[CMD_NAV_Waypoint_CMD_NAV_Hover] (
    [Time] nvarchar(max)  NOT NULL,
    [Id] int  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Set_Base_CMD_DO_Return_To_Base'
CREATE TABLE [dbo].[CMD_NAV_Set_Base_CMD_DO_Return_To_Base] (
    [UseCurrent] nvarchar(max)  NOT NULL,
    [Id] int  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Takeoff_CMD_DO_Change_Speed'
CREATE TABLE [dbo].[CMD_NAV_Takeoff_CMD_DO_Change_Speed] (
    [HorizontalSpeed] float  NULL,
    [VerticalSpeed] float  NULL,
    [Id] int  NOT NULL
);
GO

-- Creating table 'MapRestrictedSet_Weather'
CREATE TABLE [dbo].[MapRestrictedSet_Weather] (
    [Location] nvarchar(max)  NOT NULL,
    [Name_Station] nvarchar(max)  NOT NULL,
    [AvgWindSpdMPH] decimal(18,0)  NOT NULL,
    [AvgWindDir] decimal(18,0)  NOT NULL,
    [MaxWindSpdMPH] decimal(18,0)  NOT NULL,
    [WindDiratMax] decimal(18,0)  NOT NULL,
    [AvgTempDeg_F] decimal(18,0)  NOT NULL,
    [MaxTempDeg_F] decimal(18,0)  NOT NULL,
    [MinTempDeg_F] decimal(18,0)  NOT NULL,
    [AvgRH_Perc] decimal(18,0)  NOT NULL,
    [AvgBarPress_mb] decimal(18,0)  NOT NULL,
    [TotalRainInches] decimal(18,0)  NOT NULL,
    [AvgSolar_WPerm2] decimal(18,0)  NOT NULL,
    [BattVoltMin] decimal(18,0)  NOT NULL,
    [Id] int  NOT NULL
);
GO

-- --------------------------------------------------
-- Creating all PRIMARY KEY constraints
-- --------------------------------------------------

-- Creating primary key on [Id] in table 'UAVs'
ALTER TABLE [dbo].[UAVs]
ADD CONSTRAINT [PK_UAVs]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'FlightStates'
ALTER TABLE [dbo].[FlightStates]
ADD CONSTRAINT [PK_FlightStates]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'Configurations'
ALTER TABLE [dbo].[Configurations]
ADD CONSTRAINT [PK_Configurations]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'Equipments'
ALTER TABLE [dbo].[Equipments]
ADD CONSTRAINT [PK_Equipments]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'EquipmentHealths'
ALTER TABLE [dbo].[EquipmentHealths]
ADD CONSTRAINT [PK_EquipmentHealths]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'NonownshipVehicles'
ALTER TABLE [dbo].[NonownshipVehicles]
ADD CONSTRAINT [PK_NonownshipVehicles]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'Schedules'
ALTER TABLE [dbo].[Schedules]
ADD CONSTRAINT [PK_Schedules]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'Orders'
ALTER TABLE [dbo].[Orders]
ADD CONSTRAINT [PK_Orders]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [id] in table 'Missions'
ALTER TABLE [dbo].[Missions]
ADD CONSTRAINT [PK_Missions]
    PRIMARY KEY CLUSTERED ([id] ASC);
GO

-- Creating primary key on [id] in table 'Maintenances'
ALTER TABLE [dbo].[Maintenances]
ADD CONSTRAINT [PK_Maintenances]
    PRIMARY KEY CLUSTERED ([id] ASC);
GO

-- Creating primary key on [id] in table 'MissionLogs'
ALTER TABLE [dbo].[MissionLogs]
ADD CONSTRAINT [PK_MissionLogs]
    PRIMARY KEY CLUSTERED ([id] ASC);
GO

-- Creating primary key on [id] in table 'MissionLogActivities'
ALTER TABLE [dbo].[MissionLogActivities]
ADD CONSTRAINT [PK_MissionLogActivities]
    PRIMARY KEY CLUSTERED ([id] ASC);
GO

-- Creating primary key on [user_id] in table 'Users'
ALTER TABLE [dbo].[Users]
ADD CONSTRAINT [PK_Users]
    PRIMARY KEY CLUSTERED ([user_id] ASC);
GO

-- Creating primary key on [Id] in table 'UserRoles'
ALTER TABLE [dbo].[UserRoles]
ADD CONSTRAINT [PK_UserRoles]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'CMD_NAV_Waypoint'
ALTER TABLE [dbo].[CMD_NAV_Waypoint]
ADD CONSTRAINT [PK_CMD_NAV_Waypoint]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'CMD_NAV_Takeoff'
ALTER TABLE [dbo].[CMD_NAV_Takeoff]
ADD CONSTRAINT [PK_CMD_NAV_Takeoff]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'CMD_CONDITION_Rates'
ALTER TABLE [dbo].[CMD_CONDITION_Rates]
ADD CONSTRAINT [PK_CMD_CONDITION_Rates]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'CMD_NAV_Target'
ALTER TABLE [dbo].[CMD_NAV_Target]
ADD CONSTRAINT [PK_CMD_NAV_Target]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'CMD_NAV_Set_Base'
ALTER TABLE [dbo].[CMD_NAV_Set_Base]
ADD CONSTRAINT [PK_CMD_NAV_Set_Base]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'CMD_NAV_Land'
ALTER TABLE [dbo].[CMD_NAV_Land]
ADD CONSTRAINT [PK_CMD_NAV_Land]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'CMD_ACK'
ALTER TABLE [dbo].[CMD_ACK]
ADD CONSTRAINT [PK_CMD_ACK]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'Waypoints'
ALTER TABLE [dbo].[Waypoints]
ADD CONSTRAINT [PK_Waypoints]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [event_id] in table 'EventLogs'
ALTER TABLE [dbo].[EventLogs]
ADD CONSTRAINT [PK_EventLogs]
    PRIMARY KEY CLUSTERED ([event_id] ASC);
GO

-- Creating primary key on [Id] in table 'MapAreaSet'
ALTER TABLE [dbo].[MapAreaSet]
ADD CONSTRAINT [PK_MapAreaSet]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'MapRestrictedSet'
ALTER TABLE [dbo].[MapRestrictedSet]
ADD CONSTRAINT [PK_MapRestrictedSet]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'MapPointSet'
ALTER TABLE [dbo].[MapPointSet]
ADD CONSTRAINT [PK_MapPointSet]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'CMD_NAV_Return'
ALTER TABLE [dbo].[CMD_NAV_Return]
ADD CONSTRAINT [PK_CMD_NAV_Return]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'CMD_NAV_Hold'
ALTER TABLE [dbo].[CMD_NAV_Hold]
ADD CONSTRAINT [PK_CMD_NAV_Hold]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'CMD_NAV_Adjust'
ALTER TABLE [dbo].[CMD_NAV_Adjust]
ADD CONSTRAINT [PK_CMD_NAV_Adjust]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'CMD_NAV_Waypoint_CMD_NAV_Hover'
ALTER TABLE [dbo].[CMD_NAV_Waypoint_CMD_NAV_Hover]
ADD CONSTRAINT [PK_CMD_NAV_Waypoint_CMD_NAV_Hover]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'CMD_NAV_Set_Base_CMD_DO_Return_To_Base'
ALTER TABLE [dbo].[CMD_NAV_Set_Base_CMD_DO_Return_To_Base]
ADD CONSTRAINT [PK_CMD_NAV_Set_Base_CMD_DO_Return_To_Base]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'CMD_NAV_Takeoff_CMD_DO_Change_Speed'
ALTER TABLE [dbo].[CMD_NAV_Takeoff_CMD_DO_Change_Speed]
ADD CONSTRAINT [PK_CMD_NAV_Takeoff_CMD_DO_Change_Speed]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'MapRestrictedSet_Weather'
ALTER TABLE [dbo].[MapRestrictedSet_Weather]
ADD CONSTRAINT [PK_MapRestrictedSet_Weather]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

-- Creating foreign key on [Configurations_Id] in table 'UAVs'
ALTER TABLE [dbo].[UAVs]
ADD CONSTRAINT [FK_VehicleConfiguration]
    FOREIGN KEY ([Configurations_Id])
    REFERENCES [dbo].[Configurations]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_VehicleConfiguration'
CREATE INDEX [IX_FK_VehicleConfiguration]
ON [dbo].[UAVs]
    ([Configurations_Id]);
GO

-- Creating foreign key on [Configuration_Id] in table 'Equipments'
ALTER TABLE [dbo].[Equipments]
ADD CONSTRAINT [FK_ConfigurationEquipmentList]
    FOREIGN KEY ([Configuration_Id])
    REFERENCES [dbo].[Configurations]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_ConfigurationEquipmentList'
CREATE INDEX [IX_FK_ConfigurationEquipmentList]
ON [dbo].[Equipments]
    ([Configuration_Id]);
GO

-- Creating foreign key on [EquipmentList_Id] in table 'EquipmentHealths'
ALTER TABLE [dbo].[EquipmentHealths]
ADD CONSTRAINT [FK_EuipmentHealthEquipmentList]
    FOREIGN KEY ([EquipmentList_Id])
    REFERENCES [dbo].[Equipments]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_EuipmentHealthEquipmentList'
CREATE INDEX [IX_FK_EuipmentHealthEquipmentList]
ON [dbo].[EquipmentHealths]
    ([EquipmentList_Id]);
GO

-- Creating foreign key on [Vehicle_Id] in table 'EquipmentHealths'
ALTER TABLE [dbo].[EquipmentHealths]
ADD CONSTRAINT [FK_VehicleEuipmentHealth]
    FOREIGN KEY ([Vehicle_Id])
    REFERENCES [dbo].[UAVs]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_VehicleEuipmentHealth'
CREATE INDEX [IX_FK_VehicleEuipmentHealth]
ON [dbo].[EquipmentHealths]
    ([Vehicle_Id]);
GO

-- Creating foreign key on [UAVId] in table 'FlightStates'
ALTER TABLE [dbo].[FlightStates]
ADD CONSTRAINT [FK_UAVFlightState]
    FOREIGN KEY ([UAVId])
    REFERENCES [dbo].[UAVs]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_UAVFlightState'
CREATE INDEX [IX_FK_UAVFlightState]
ON [dbo].[FlightStates]
    ([UAVId]);
GO

-- Creating foreign key on [UAVId] in table 'Schedules'
ALTER TABLE [dbo].[Schedules]
ADD CONSTRAINT [FK_UAVSchedule]
    FOREIGN KEY ([UAVId])
    REFERENCES [dbo].[UAVs]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_UAVSchedule'
CREATE INDEX [IX_FK_UAVSchedule]
ON [dbo].[Schedules]
    ([UAVId]);
GO

-- Creating foreign key on [Mission_id] in table 'Orders'
ALTER TABLE [dbo].[Orders]
ADD CONSTRAINT [FK_MissionOrder]
    FOREIGN KEY ([Mission_id])
    REFERENCES [dbo].[Missions]
        ([id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_MissionOrder'
CREATE INDEX [IX_FK_MissionOrder]
ON [dbo].[Orders]
    ([Mission_id]);
GO

-- Creating foreign key on [ScheduleId] in table 'Missions'
ALTER TABLE [dbo].[Missions]
ADD CONSTRAINT [FK_MissionSchedule]
    FOREIGN KEY ([ScheduleId])
    REFERENCES [dbo].[Schedules]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_MissionSchedule'
CREATE INDEX [IX_FK_MissionSchedule]
ON [dbo].[Missions]
    ([ScheduleId]);
GO

-- Creating foreign key on [ScheduleId] in table 'Maintenances'
ALTER TABLE [dbo].[Maintenances]
ADD CONSTRAINT [FK_MaintenanceSchedule]
    FOREIGN KEY ([ScheduleId])
    REFERENCES [dbo].[Schedules]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_MaintenanceSchedule'
CREATE INDEX [IX_FK_MaintenanceSchedule]
ON [dbo].[Maintenances]
    ([ScheduleId]);
GO

-- Creating foreign key on [Mission_id] in table 'MissionLogs'
ALTER TABLE [dbo].[MissionLogs]
ADD CONSTRAINT [FK_MissionMissionLog]
    FOREIGN KEY ([Mission_id])
    REFERENCES [dbo].[Missions]
        ([id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_MissionMissionLog'
CREATE INDEX [IX_FK_MissionMissionLog]
ON [dbo].[MissionLogs]
    ([Mission_id]);
GO

-- Creating foreign key on [MissionLog_id] in table 'MissionLogActivities'
ALTER TABLE [dbo].[MissionLogActivities]
ADD CONSTRAINT [FK_MissionLogMissionLogActivity]
    FOREIGN KEY ([MissionLog_id])
    REFERENCES [dbo].[MissionLogs]
        ([id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_MissionLogMissionLogActivity'
CREATE INDEX [IX_FK_MissionLogMissionLogActivity]
ON [dbo].[MissionLogActivities]
    ([MissionLog_id]);
GO

-- Creating foreign key on [UserRole_Id] in table 'Users'
ALTER TABLE [dbo].[Users]
ADD CONSTRAINT [FK_UserUserRole]
    FOREIGN KEY ([UserRole_Id])
    REFERENCES [dbo].[UserRoles]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_UserUserRole'
CREATE INDEX [IX_FK_UserUserRole]
ON [dbo].[Users]
    ([UserRole_Id]);
GO

-- Creating foreign key on [NextWaypointId] in table 'Waypoints'
ALTER TABLE [dbo].[Waypoints]
ADD CONSTRAINT [FK_WaypointWaypoint]
    FOREIGN KEY ([NextWaypointId])
    REFERENCES [dbo].[Waypoints]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_WaypointWaypoint'
CREATE INDEX [IX_FK_WaypointWaypoint]
ON [dbo].[Waypoints]
    ([NextWaypointId]);
GO

-- Creating foreign key on [MissionId] in table 'Waypoints'
ALTER TABLE [dbo].[Waypoints]
ADD CONSTRAINT [FK_WaypointMission]
    FOREIGN KEY ([MissionId])
    REFERENCES [dbo].[Missions]
        ([id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_WaypointMission'
CREATE INDEX [IX_FK_WaypointMission]
ON [dbo].[Waypoints]
    ([MissionId]);
GO

-- Creating foreign key on [UAVId] in table 'EventLogs'
ALTER TABLE [dbo].[EventLogs]
ADD CONSTRAINT [FK_UAVEventLog]
    FOREIGN KEY ([UAVId])
    REFERENCES [dbo].[UAVs]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_UAVEventLog'
CREATE INDEX [IX_FK_UAVEventLog]
ON [dbo].[EventLogs]
    ([UAVId]);
GO

-- Creating foreign key on [User_user_id] in table 'UAVs'
ALTER TABLE [dbo].[UAVs]
ADD CONSTRAINT [FK_UserUAV]
    FOREIGN KEY ([User_user_id])
    REFERENCES [dbo].[Users]
        ([user_id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_UserUAV'
CREATE INDEX [IX_FK_UserUAV]
ON [dbo].[UAVs]
    ([User_user_id]);
GO

-- Creating foreign key on [Id] in table 'CMD_NAV_Waypoint_CMD_NAV_Hover'
ALTER TABLE [dbo].[CMD_NAV_Waypoint_CMD_NAV_Hover]
ADD CONSTRAINT [FK_CMD_NAV_Hover_inherits_CMD_NAV_Waypoint]
    FOREIGN KEY ([Id])
    REFERENCES [dbo].[CMD_NAV_Waypoint]
        ([Id])
    ON DELETE CASCADE ON UPDATE NO ACTION;
GO

-- Creating foreign key on [Id] in table 'CMD_NAV_Set_Base_CMD_DO_Return_To_Base'
ALTER TABLE [dbo].[CMD_NAV_Set_Base_CMD_DO_Return_To_Base]
ADD CONSTRAINT [FK_CMD_DO_Return_To_Base_inherits_CMD_NAV_Set_Base]
    FOREIGN KEY ([Id])
    REFERENCES [dbo].[CMD_NAV_Set_Base]
        ([Id])
    ON DELETE CASCADE ON UPDATE NO ACTION;
GO

-- Creating foreign key on [Id] in table 'CMD_NAV_Takeoff_CMD_DO_Change_Speed'
ALTER TABLE [dbo].[CMD_NAV_Takeoff_CMD_DO_Change_Speed]
ADD CONSTRAINT [FK_CMD_DO_Change_Speed_inherits_CMD_NAV_Takeoff]
    FOREIGN KEY ([Id])
    REFERENCES [dbo].[CMD_NAV_Takeoff]
        ([Id])
    ON DELETE CASCADE ON UPDATE NO ACTION;
GO

-- Creating foreign key on [Id] in table 'MapRestrictedSet_Weather'
ALTER TABLE [dbo].[MapRestrictedSet_Weather]
ADD CONSTRAINT [FK_Weather_inherits_MapRestricted]
    FOREIGN KEY ([Id])
    REFERENCES [dbo].[MapRestrictedSet]
        ([Id])
    ON DELETE CASCADE ON UPDATE NO ACTION;
GO

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------