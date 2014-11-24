
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, 2012 and Azure
-- --------------------------------------------------
-- Date Created: 11/24/2014 09:56:04
-- Generated from EDMX file: C:\Users\Varatep-mac\Documents\Visual Studio 2013\Projects\NEST-App\NEST-App\Models\Scheduling.edmx
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

-- Creating table 'Maintenances'
CREATE TABLE [dbo].[Maintenances] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [UAV_Type] nvarchar(max)  NOT NULL,
    [UAV_Name] nvarchar(max)  NOT NULL,
    [last_maintenance] nvarchar(max)  NOT NULL,
    [next_maintenance] nvarchar(max)  NOT NULL,
    [time_remaining] nvarchar(max)  NOT NULL,
    [ScheduleId] int  NOT NULL
);
GO

-- Creating table 'DeliveryStatus'
CREATE TABLE [dbo].[DeliveryStatus] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [time_departure] nvarchar(max)  NOT NULL,
    [location_departure] nvarchar(max)  NOT NULL,
    [sta] nvarchar(max)  NOT NULL,
    [eta] nvarchar(max)  NOT NULL,
    [cargo_number] nvarchar(max)  NOT NULL,
    [status_comment] nvarchar(max)  NOT NULL,
    [time_return] nvarchar(max)  NOT NULL,
    [time_delivery] nvarchar(max)  NOT NULL
);
GO

-- Creating table 'Schedules'
CREATE TABLE [dbo].[Schedules] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [DeliveryStatus_Id] int  NOT NULL
);
GO

-- --------------------------------------------------
-- Creating all PRIMARY KEY constraints
-- --------------------------------------------------

-- Creating primary key on [Id] in table 'Maintenances'
ALTER TABLE [dbo].[Maintenances]
ADD CONSTRAINT [PK_Maintenances]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'DeliveryStatus'
ALTER TABLE [dbo].[DeliveryStatus]
ADD CONSTRAINT [PK_DeliveryStatus]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'Schedules'
ALTER TABLE [dbo].[Schedules]
ADD CONSTRAINT [PK_Schedules]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

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

-- Creating foreign key on [DeliveryStatus_Id] in table 'Schedules'
ALTER TABLE [dbo].[Schedules]
ADD CONSTRAINT [FK_ScheduleDeliveryStatus]
    FOREIGN KEY ([DeliveryStatus_Id])
    REFERENCES [dbo].[DeliveryStatus]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_ScheduleDeliveryStatus'
CREATE INDEX [IX_FK_ScheduleDeliveryStatus]
ON [dbo].[Schedules]
    ([DeliveryStatus_Id]);
GO

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------