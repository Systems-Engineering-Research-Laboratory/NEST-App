
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, 2012 and Azure
-- --------------------------------------------------
-- Date Created: 11/13/2014 22:01:23
-- Generated from EDMX file: C:\Users\Varatep-mac\documents\visual studio 2013\Projects\NEST-App\NEST-App\Models\Mapinfo.edmx
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

-- Creating table 'UAVInformationSet'
CREATE TABLE [dbo].[UAVInformationSet] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Position] nvarchar(max)  NOT NULL,
    [Timestamp] nvarchar(max)  NOT NULL,
    [VelocityX] nvarchar(max)  NOT NULL,
    [VelocityY] nvarchar(max)  NOT NULL,
    [VelocityZ] nvarchar(max)  NOT NULL,
    [Waypoint] nvarchar(max)  NOT NULL,
    [Path] nvarchar(max)  NOT NULL,
    [Origin] nvarchar(max)  NOT NULL,
    [Destination] nvarchar(max)  NOT NULL
);
GO

-- Creating table 'PopulationDensitySet'
CREATE TABLE [dbo].[PopulationDensitySet] (
    [Id] int IDENTITY(1,1) NOT NULL
);
GO

-- Creating table 'MapInfoSet'
CREATE TABLE [dbo].[MapInfoSet] (
    [ZoningInformation] nvarchar(max)  NOT NULL,
    [PopulationDensity] nvarchar(max)  NOT NULL,
    [Map_Latitude] nvarchar(max)  NOT NULL,
    [Map_Longitude] nvarchar(max)  NOT NULL,
    [ZoneName] nvarchar(max)  NOT NULL,
    [Map_Altitude] nvarchar(max)  NOT NULL,
    [SeaLevel] nvarchar(max)  NOT NULL,
    [SafeLandingLocation] nvarchar(max)  NOT NULL,
    [NonOwnShipAircraftPath] nvarchar(max)  NOT NULL,
    [MapInfoID] nvarchar(max)  NOT NULL,
    [UAVInformation_Id] int  NOT NULL
);
GO

-- Creating table 'WeatherSet'
CREATE TABLE [dbo].[WeatherSet] (
    [WeatherID] int IDENTITY(1,1) NOT NULL,
    [Location] nvarchar(max)  NOT NULL,
    [Name_Station] nvarchar(max)  NOT NULL,
    [AvgWindSpdMPH] nvarchar(max)  NOT NULL,
    [AvgWindDir] nvarchar(max)  NOT NULL,
    [MaxWindSpdMPH] nvarchar(max)  NOT NULL,
    [WindDiratMax] nvarchar(max)  NOT NULL,
    [AvgTempDeg_F] nvarchar(max)  NOT NULL,
    [MaxTempDeg_F] nvarchar(max)  NOT NULL,
    [MinTempDeg_F] nvarchar(max)  NOT NULL,
    [AvgRH_Perc] nvarchar(max)  NOT NULL,
    [AvgBarPress_mb] nvarchar(max)  NOT NULL,
    [TotalRainInches] nvarchar(max)  NOT NULL,
    [AvgSolar_WPerm2] nvarchar(max)  NOT NULL,
    [BattVoltMin] nvarchar(max)  NOT NULL,
    [Warning] nvarchar(max)  NOT NULL,
    [MapInfo_MapInfoID] nvarchar(max)  NOT NULL,
    [UAV_Utilities_MapInfoID] nvarchar(max)  NOT NULL,
    [RestrictedArea_MapInfoID] nvarchar(max)  NOT NULL
);
GO

-- Creating table 'MapInfoSet_UAV_Warehouse'
CREATE TABLE [dbo].[MapInfoSet_UAV_Warehouse] (
    [UACLocation] nvarchar(max)  NOT NULL,
    [ChargingStation] nvarchar(max)  NOT NULL,
    [MaintenanceCenter] nvarchar(max)  NOT NULL,
    [Warehouse] nvarchar(max)  NOT NULL,
    [CustomerControlRelevant_Facility] nvarchar(max)  NOT NULL,
    [UAV_WarehouseID] nvarchar(max)  NOT NULL,
    [MapInfoID] nvarchar(max)  NOT NULL
);
GO

-- Creating table 'MapInfoSet_RestrictedArea'
CREATE TABLE [dbo].[MapInfoSet_RestrictedArea] (
    [Restiricted_Latitude] nvarchar(max)  NOT NULL,
    [Restiricted_Longitude] nvarchar(max)  NOT NULL,
    [Restricited_Altitude] nvarchar(max)  NOT NULL,
    [Creator_Created] nvarchar(max)  NOT NULL,
    [Time_Created] nvarchar(max)  NOT NULL,
    [Reason_Created] nvarchar(max)  NOT NULL,
    [RestrictedAreaID] nvarchar(max)  NOT NULL,
    [MapInfoID] nvarchar(max)  NOT NULL
);
GO

-- --------------------------------------------------
-- Creating all PRIMARY KEY constraints
-- --------------------------------------------------

-- Creating primary key on [Id] in table 'UAVInformationSet'
ALTER TABLE [dbo].[UAVInformationSet]
ADD CONSTRAINT [PK_UAVInformationSet]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'PopulationDensitySet'
ALTER TABLE [dbo].[PopulationDensitySet]
ADD CONSTRAINT [PK_PopulationDensitySet]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [MapInfoID] in table 'MapInfoSet'
ALTER TABLE [dbo].[MapInfoSet]
ADD CONSTRAINT [PK_MapInfoSet]
    PRIMARY KEY CLUSTERED ([MapInfoID] ASC);
GO

-- Creating primary key on [WeatherID] in table 'WeatherSet'
ALTER TABLE [dbo].[WeatherSet]
ADD CONSTRAINT [PK_WeatherSet]
    PRIMARY KEY CLUSTERED ([WeatherID] ASC);
GO

-- Creating primary key on [MapInfoID] in table 'MapInfoSet_UAV_Warehouse'
ALTER TABLE [dbo].[MapInfoSet_UAV_Warehouse]
ADD CONSTRAINT [PK_MapInfoSet_UAV_Warehouse]
    PRIMARY KEY CLUSTERED ([MapInfoID] ASC);
GO

-- Creating primary key on [MapInfoID] in table 'MapInfoSet_RestrictedArea'
ALTER TABLE [dbo].[MapInfoSet_RestrictedArea]
ADD CONSTRAINT [PK_MapInfoSet_RestrictedArea]
    PRIMARY KEY CLUSTERED ([MapInfoID] ASC);
GO

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

-- Creating foreign key on [MapInfo_MapInfoID] in table 'WeatherSet'
ALTER TABLE [dbo].[WeatherSet]
ADD CONSTRAINT [FK_MapInfoWeather]
    FOREIGN KEY ([MapInfo_MapInfoID])
    REFERENCES [dbo].[MapInfoSet]
        ([MapInfoID])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_MapInfoWeather'
CREATE INDEX [IX_FK_MapInfoWeather]
ON [dbo].[WeatherSet]
    ([MapInfo_MapInfoID]);
GO

-- Creating foreign key on [UAV_Utilities_MapInfoID] in table 'WeatherSet'
ALTER TABLE [dbo].[WeatherSet]
ADD CONSTRAINT [FK_UAV_UtilitiesWeather]
    FOREIGN KEY ([UAV_Utilities_MapInfoID])
    REFERENCES [dbo].[MapInfoSet_UAV_Warehouse]
        ([MapInfoID])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_UAV_UtilitiesWeather'
CREATE INDEX [IX_FK_UAV_UtilitiesWeather]
ON [dbo].[WeatherSet]
    ([UAV_Utilities_MapInfoID]);
GO

-- Creating foreign key on [RestrictedArea_MapInfoID] in table 'WeatherSet'
ALTER TABLE [dbo].[WeatherSet]
ADD CONSTRAINT [FK_RestrictedAreaWeather]
    FOREIGN KEY ([RestrictedArea_MapInfoID])
    REFERENCES [dbo].[MapInfoSet_RestrictedArea]
        ([MapInfoID])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_RestrictedAreaWeather'
CREATE INDEX [IX_FK_RestrictedAreaWeather]
ON [dbo].[WeatherSet]
    ([RestrictedArea_MapInfoID]);
GO

-- Creating foreign key on [UAVInformation_Id] in table 'MapInfoSet'
ALTER TABLE [dbo].[MapInfoSet]
ADD CONSTRAINT [FK_UAVInformationMapInfo]
    FOREIGN KEY ([UAVInformation_Id])
    REFERENCES [dbo].[UAVInformationSet]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_UAVInformationMapInfo'
CREATE INDEX [IX_FK_UAVInformationMapInfo]
ON [dbo].[MapInfoSet]
    ([UAVInformation_Id]);
GO

-- Creating foreign key on [MapInfoID] in table 'MapInfoSet_UAV_Warehouse'
ALTER TABLE [dbo].[MapInfoSet_UAV_Warehouse]
ADD CONSTRAINT [FK_UAV_Warehouse_inherits_MapInfo]
    FOREIGN KEY ([MapInfoID])
    REFERENCES [dbo].[MapInfoSet]
        ([MapInfoID])
    ON DELETE CASCADE ON UPDATE NO ACTION;
GO

-- Creating foreign key on [MapInfoID] in table 'MapInfoSet_RestrictedArea'
ALTER TABLE [dbo].[MapInfoSet_RestrictedArea]
ADD CONSTRAINT [FK_RestrictedArea_inherits_MapInfo]
    FOREIGN KEY ([MapInfoID])
    REFERENCES [dbo].[MapInfoSet]
        ([MapInfoID])
    ON DELETE CASCADE ON UPDATE NO ACTION;
GO

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------