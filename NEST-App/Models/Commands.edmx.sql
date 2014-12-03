
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, 2012 and Azure
-- --------------------------------------------------
-- Date Created: 12/03/2014 08:07:17
-- Generated from EDMX file: C:\Code\NEST\NEST-App\NEST-App\Models\Commands.edmx
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

-- Creating table 'CMD_NAV_Waypoint'
CREATE TABLE [dbo].[CMD_NAV_Waypoint] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Altitude] nvarchar(max)  NOT NULL,
    [Latitude] nvarchar(max)  NOT NULL,
    [Longitude] nvarchar(max)  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Takeoff'
CREATE TABLE [dbo].[CMD_NAV_Takeoff] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [TakeoffPitch] nvarchar(max)  NOT NULL,
    [Altitude] nvarchar(max)  NOT NULL,
    [XAcceleration] nvarchar(max)  NOT NULL,
    [YAcceleration] nvarchar(max)  NOT NULL,
    [ZAcceleration] nvarchar(max)  NOT NULL,
    [Throttle] nvarchar(max)  NOT NULL
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
    [Longitude] float  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Set_Base'
CREATE TABLE [dbo].[CMD_NAV_Set_Base] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Altitude] nvarchar(max)  NOT NULL,
    [Latitude] nvarchar(max)  NOT NULL,
    [Longitude] nvarchar(max)  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Land'
CREATE TABLE [dbo].[CMD_NAV_Land] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Altitude] nvarchar(max)  NOT NULL,
    [Latitude] nvarchar(max)  NOT NULL,
    [Longitude] nvarchar(max)  NOT NULL,
    [Throttle] nvarchar(max)  NOT NULL
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
    [Speed] nvarchar(max)  NOT NULL,
    [XVelocity] nvarchar(max)  NOT NULL,
    [YVelocity] nvarchar(max)  NOT NULL,
    [ZVelocity] nvarchar(max)  NOT NULL,
    [Heading] nvarchar(max)  NOT NULL,
    [Id] int  NOT NULL
);
GO

-- Creating table 'CMD_NAV_Takeoff_CMD_DO_Change_Dynamics'
CREATE TABLE [dbo].[CMD_NAV_Takeoff_CMD_DO_Change_Dynamics] (
    [Roll] nvarchar(max)  NOT NULL,
    [Pitch] nvarchar(max)  NOT NULL,
    [Yaw] nvarchar(max)  NOT NULL,
    [Id] int  NOT NULL
);
GO

-- --------------------------------------------------
-- Creating all PRIMARY KEY constraints
-- --------------------------------------------------

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

-- Creating primary key on [Id] in table 'CMD_NAV_Takeoff_CMD_DO_Change_Dynamics'
ALTER TABLE [dbo].[CMD_NAV_Takeoff_CMD_DO_Change_Dynamics]
ADD CONSTRAINT [PK_CMD_NAV_Takeoff_CMD_DO_Change_Dynamics]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

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

-- Creating foreign key on [Id] in table 'CMD_NAV_Takeoff_CMD_DO_Change_Dynamics'
ALTER TABLE [dbo].[CMD_NAV_Takeoff_CMD_DO_Change_Dynamics]
ADD CONSTRAINT [FK_CMD_DO_Change_Dynamics_inherits_CMD_NAV_Takeoff]
    FOREIGN KEY ([Id])
    REFERENCES [dbo].[CMD_NAV_Takeoff]
        ([Id])
    ON DELETE CASCADE ON UPDATE NO ACTION;
GO

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------