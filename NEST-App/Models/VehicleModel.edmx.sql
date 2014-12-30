
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, 2012 and Azure
-- --------------------------------------------------
-- Date Created: 12/29/2014 17:41:39
-- Generated from EDMX file: C:\Users\Varatep-mac\Documents\Visual Studio 2013\Projects\NEST-App\NEST-App\Models\VehicleModel.edmx
-- --------------------------------------------------

SET QUOTED_IDENTIFIER OFF;
GO
USE [C:\USERS\VARATEP-MAC\DOCUMENTS\VISUAL STUDIO 2013\PROJECTS\NEST-APP\NEST-APP\APP_DATA\NEST_DB.MDF];
GO
IF SCHEMA_ID(N'dbo') IS NULL EXECUTE(N'CREATE SCHEMA [dbo]');
GO

-- --------------------------------------------------
-- Dropping existing FOREIGN KEY constraints
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[FK_VehicleConfiguration]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[UAVs1] DROP CONSTRAINT [FK_VehicleConfiguration];
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
    ALTER TABLE [dbo].[Schedules_Mission] DROP CONSTRAINT [FK_MissionOrder];
GO
IF OBJECT_ID(N'[dbo].[FK_ScheduleMission]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Schedules_Mission] DROP CONSTRAINT [FK_ScheduleMission];
GO
IF OBJECT_ID(N'[dbo].[FK_ScheduleMaintenance]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Schedules_Maintenance] DROP CONSTRAINT [FK_ScheduleMaintenance];
GO
IF OBJECT_ID(N'[dbo].[FK_Mission_inherits_Schedule]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Schedules_Mission] DROP CONSTRAINT [FK_Mission_inherits_Schedule];
GO
IF OBJECT_ID(N'[dbo].[FK_Maintenance_inherits_Schedule]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Schedules_Maintenance] DROP CONSTRAINT [FK_Maintenance_inherits_Schedule];
GO

-- --------------------------------------------------
-- Dropping existing tables
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[UAVs1]', 'U') IS NOT NULL
    DROP TABLE [dbo].[UAVs1];
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
IF OBJECT_ID(N'[dbo].[Schedules_Mission]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Schedules_Mission];
GO
IF OBJECT_ID(N'[dbo].[Schedules_Maintenance]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Schedules_Maintenance];
GO

-- --------------------------------------------------
-- Creating all tables
-- --------------------------------------------------

-- Creating table 'UAVs1'
CREATE TABLE [dbo].[UAVs1] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Callsign] nvarchar(max)  NOT NULL,
    [NumDeliveries] int  NOT NULL,
    [Mileage] int  NOT NULL,
    [Configurations_Id] int  NOT NULL
);
GO

-- Creating table 'FlightStates'
CREATE TABLE [dbo].[FlightStates] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Timestamp] datetime  NOT NULL,
    [Position] geography  NOT NULL,
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
    [UAVId] int  NOT NULL
);
GO

-- Creating table 'Configurations'
CREATE TABLE [dbo].[Configurations] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Name] nvarchar(max)  NOT NULL,
    [Classification] nvarchar(max)  NOT NULL,
    [NumberOfMotors] tinyint  NOT NULL
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
    [Configuration_Id] int  NOT NULL
);
GO

-- Creating table 'EquipmentHealths'
CREATE TABLE [dbo].[EquipmentHealths] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Health] float  NOT NULL,
    [LastMaintenance] nvarchar(max)  NOT NULL,
    [DateReceived] datetime  NOT NULL,
    [EquipmentList_Id] int  NOT NULL,
    [Vehicle_Id] int  NOT NULL
);
GO

-- Creating table 'NonownshipVehicles'
CREATE TABLE [dbo].[NonownshipVehicles] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Position] geometry  NOT NULL,
    [Velocity] float  NOT NULL,
    [VelocityX] nvarchar(max)  NOT NULL,
    [VelocityY] nvarchar(max)  NOT NULL,
    [VelocityZ] nvarchar(max)  NOT NULL,
    [Yaw] float  NOT NULL,
    [FlightPlan] nvarchar(max)  NOT NULL
);
GO

-- Creating table 'Schedules'
CREATE TABLE [dbo].[Schedules] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [UAVId] int  NULL
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
    [Mission_id] int  NOT NULL
);
GO

-- Creating table 'Missions'
CREATE TABLE [dbo].[Missions] (
    [Phase] varchar(50)  NOT NULL,
    [FlightPattern] varchar(50)  NULL,
    [Payload] varchar(max)  NOT NULL,
    [Priority] int  NOT NULL,
    [FinancialCost] decimal(19,4)  NULL,
    [TimeAssigned] datetime  NOT NULL,
    [TimeCompleted] datetime  NOT NULL,
    [DestinationCoordinates] geography  NOT NULL,
    [ScheduledCompletionTime] datetime  NOT NULL,
    [EstimatedCompletionTime] datetime  NOT NULL,
    [id] int  NOT NULL,
    [ScheduleId] int  NOT NULL
);
GO

-- Creating table 'Maintenances'
CREATE TABLE [dbo].[Maintenances] (
    [last_maintenance] datetime  NOT NULL,
    [next_maintenance] datetime  NOT NULL,
    [time_remaining] nvarchar(max)  NOT NULL,
    [id] int  NOT NULL,
    [ScheduleId] int  NOT NULL
);
GO

-- --------------------------------------------------
-- Creating all PRIMARY KEY constraints
-- --------------------------------------------------

-- Creating primary key on [Id] in table 'UAVs1'
ALTER TABLE [dbo].[UAVs1]
ADD CONSTRAINT [PK_UAVs1]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id], [Timestamp] in table 'FlightStates'
ALTER TABLE [dbo].[FlightStates]
ADD CONSTRAINT [PK_FlightStates]
    PRIMARY KEY CLUSTERED ([Id], [Timestamp] ASC);
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

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

-- Creating foreign key on [Configurations_Id] in table 'UAVs1'
ALTER TABLE [dbo].[UAVs1]
ADD CONSTRAINT [FK_VehicleConfiguration]
    FOREIGN KEY ([Configurations_Id])
    REFERENCES [dbo].[Configurations]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_VehicleConfiguration'
CREATE INDEX [IX_FK_VehicleConfiguration]
ON [dbo].[UAVs1]
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
    REFERENCES [dbo].[UAVs1]
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
    REFERENCES [dbo].[UAVs1]
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
    REFERENCES [dbo].[UAVs1]
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

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------