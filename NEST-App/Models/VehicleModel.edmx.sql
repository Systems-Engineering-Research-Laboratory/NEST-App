
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, 2012 and Azure
-- --------------------------------------------------
-- Date Created: 11/07/2014 20:55:31
-- Generated from EDMX file: C:\Code\NEST\NEST-App\NEST-App\Models\VehicleModel.edmx
-- --------------------------------------------------

SET QUOTED_IDENTIFIER OFF;
GO
USE [NestDbContext];
GO
IF SCHEMA_ID(N'dbo') IS NULL EXECUTE(N'CREATE SCHEMA [dbo]');
GO

-- --------------------------------------------------
-- Dropping existing FOREIGN KEY constraints
-- --------------------------------------------------


-- --------------------------------------------------
-- Dropping existing tables
-- --------------------------------------------------


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
    [Vehicle_Id] int  NOT NULL
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

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

-- Creating foreign key on [Vehicle_Id] in table 'FlightStates'
ALTER TABLE [dbo].[FlightStates]
ADD CONSTRAINT [FK_VehicleState]
    FOREIGN KEY ([Vehicle_Id])
    REFERENCES [dbo].[UAVs1]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_VehicleState'
CREATE INDEX [IX_FK_VehicleState]
ON [dbo].[FlightStates]
    ([Vehicle_Id]);
GO

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

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------