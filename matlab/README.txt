DHIYA | SMART SOLAR ENERGY SYSTEM
MATLAB & SIMULINK SIMULATION
Expo 2030 Riyadh Sustainability Challenge
==================================================

1. PROJECT OVERVIEW

DHIYA (ضياء) is a proposed smart solar energy management system designed for the Expo 2030 Riyadh sustainability context.

The project explores how solar panel performance can be improved through condition-based cleaning, solar tracking, and performance monitoring. It also introduces a pavilion leaderboard concept to encourage sustainability awareness and allow visitors to compare solar performance through an interactive interface.

This package contains the MATLAB scripts, Simulink models, and visualization outputs developed to demonstrate the proposed system.

All results are based on illustrative simulation assumptions and do not represent actual Expo pavilion measurements or experimentally validated performance.

--------------------------------------------------
2. SIMULATION OBJECTIVES
--------------------------------------------------

The MATLAB/Simulink model was developed to:

- Simulate photovoltaic power generation throughout a daily solar cycle.
- Model the effect of accumulated dust on solar panel performance.
- Simulate automatic cleaning when soiling reaches a defined threshold.
- Represent the potential benefit of improved panel orientation through an idealized tracking model.
- Compare conventional PV operation with smart cleaning, tracking, and the complete DHIYA configuration.
- Calculate daily energy generation for each scenario.
- Demonstrate a normalized solar pavilion ranking concept.
- Visualize the results through MATLAB graphs, Simulink scopes, and an interactive dashboard.

--------------------------------------------------
3. SIMULATION METHODOLOGY
--------------------------------------------------

The simulation uses a simplified 100 W reference solar panel over a 24-hour period, with one-minute calculation intervals.

Main assumptions:

Reference PV capacity: 100 W
Simulation duration: 24 hours
Daylight period: 6:00 AM – 6:00 PM
Peak irradiance: 1000 W/m²
Soiling accumulation: 2 percentage points per hour
Cleaning threshold: 20% estimated soiling loss
Cleaning effectiveness: 95% removal of accumulated soiling
Cleaning energy consumption: 0.5 Wh per cycle

Solar irradiance is modeled using an idealized daily sinusoidal profile.

The conventional system represents a fixed panel with accumulated dust and no automatic cleaning.

DHIYA introduces condition-based cleaning and an idealized orientation improvement.

Tracking motor power consumption, detailed temperature effects, inverter losses, and real weather variability are not included in the current comparison.

--------------------------------------------------
4. FOUR OPERATING SCENARIOS
--------------------------------------------------

The final comparison evaluates four configurations:

A. CONVENTIONAL PV
Fixed orientation with no automatic cleaning.

B. SMART CLEANING
Fixed orientation with condition-based cleaning.

C. SOLAR TRACKING
Idealized tracking orientation with no automatic cleaning.

D. FULL DHIYA SYSTEM
Idealized tracking combined with condition-based cleaning.

These scenarios help distinguish the individual and combined effects of the proposed improvements.

--------------------------------------------------
5. SIMULATION RESULTS
--------------------------------------------------

Calculated daily energy generation:

Conventional PV:       545.7 Wh
Smart Cleaning:        649.3 Wh
Solar Tracking:        580.6 Wh
Full DHIYA:            689.0 Wh

Relative improvement compared with the conventional scenario:

Smart Cleaning:        +19.0%
Solar Tracking:         +6.4%
Full DHIYA:            +26.3%

The cleaning scenarios include an assumed 0.5 Wh deduction for the cleaning cycle.

Tracking actuator energy consumption is not included. Therefore, the reported Full DHIYA improvement is not a complete net system energy gain.

These results demonstrate the potential value of intelligent solar management under the selected assumptions. They should not be interpreted as guaranteed real-world improvements.

--------------------------------------------------
6. MAIN FILES
--------------------------------------------------

The package may contain the following project files, depending on the included development versions.

build_DHIYA_Phase2.m
Earlier model-generation script focused on dust accumulation and automatic cleaning.

build_DHIYA_Phase3.m
Generates the Phase 3 Simulink model comparing a conventional fixed panel against the DHIYA configuration.

DHIYA_Phase3.slx
Main Simulink model illustrating irradiance, orientation factors, soiling loss, cleaning events, power calculations, and pavilion scores.

DHIYA_Load_Data.m
Initializes the simulation inputs and restores the workspace variables required by the Simulink model.

DHIYA_Final_Results.m
Evaluates four operating scenarios and generates comparative power, energy, and cleaning-response graphs.

DHIYA_Control_Center_FIXED.m
Interactive MATLAB dashboard showing simulated solar power, cumulative energy, soiling, cleaning status, and illustrative pavilion rankings.

Exported PNG figures
High-resolution plots and Simulink diagrams prepared for reports and presentations.

Other MATLAB or Simulink files may represent earlier development iterations or backups.

--------------------------------------------------
7. HOW TO RUN THE SIMULATION
--------------------------------------------------

Software:
MATLAB R2026a
Simulink

STEP 1:
Extract the ZIP file into a folder.

STEP 2:
Open MATLAB and set the Current Folder to the extracted project directory. Ensure the required scripts and models are accessible on the MATLAB path.

STEP 3:
Run the initialization script:

DHIYA_Load_Data

This prepares the irradiance, orientation, dust, cleaning, and pavilion scoring inputs.

STEP 4:
Open the Simulink model:

DHIYA_Phase3.slx

Click Run.

If the model's InitFcn callback is configured, it automatically executes the initialization script.

STEP 5:
Inspect the Simulink outputs:

- Power Comparison Scope
- Dust Comparison Scope
- Cleaning Events Scope
- Pavilion Scores Display

STEP 6:
To generate the four-scenario results, run:

DHIYA_Final_Results

This creates the power comparison graph, daily energy comparison, and condition-based cleaning graph. It also exports the figures as PNG files to the MATLAB Current Folder.

STEP 7:
To open the interactive MATLAB dashboard, run:

DHIYA_Control_Center_FIXED

Use the time and extra-dust sliders to explore hypothetical operating conditions.

NOTE:
DHIYA_Final_Results.m requires variables initialized by DHIYA_Load_Data.m. Run the initialization script first when starting a new MATLAB session.

Do not rerun the original model-building script over an existing model without checking its file-existence safeguards.

--------------------------------------------------
8. SIMULINK MODEL STRUCTURE
--------------------------------------------------

The main Phase 3 Simulink model uses:

From Workspace:
Imports precomputed environmental and cleaning signals from MATLAB.

Gain and Bias:
Calculate orientation-adjusted and dust-adjusted performance factors.

Product:
Calculates solar output power by multiplying the reference power by operating factors.

Mux:
Combines multiple signals for comparison.

Scope:
Visualizes power, dust accumulation, and cleaning events.

To Workspace:
Exports simulated results for further processing.

Display:
Shows illustrative pavilion scoring values.

The dust accumulation and cleaning decisions are calculated in MATLAB before their signals are supplied to the Phase 3 Simulink model.

The four-scenario comparison is additionally calculated in DHIYA_Final_Results.m using the same underlying simulation assumptions.

--------------------------------------------------
9. PAVILION LEADERBOARD
--------------------------------------------------

DHIYA also proposes a sustainability-oriented pavilion scoring concept.

The interactive MATLAB dashboard uses a preliminary weighted score:

50% - Solar performance
30% - Solar contribution
20% - Maintenance performance

The criteria are normalized to a 0–100 scale.

Pavilion scores are illustrative demonstration values rather than actual Expo 2030 country pavilion results.

The original Phase 3 model and interactive dashboard use different preliminary scoring formulations. Therefore, their example scores should not be interpreted as identical datasets.

Further development would involve establishing validated scoring definitions, fair normalization across different pavilion capacities and operating conditions, and integration with real energy measurements.

--------------------------------------------------
10. SCOPE AND LIMITATIONS
--------------------------------------------------

This project demonstrates a proof-of-concept mathematical simulation.

It does not currently represent:

- A fully validated photovoltaic electrical model.
- Real-time measurements from Expo pavilions.
- A verified physical solar tracking controller.
- Experimentally measured cleaning effectiveness.
- Complete actuator and inverter energy losses.
- An operational closed-loop Simulink-to-hardware control system.
- Official Expo 2030 sustainability rankings.

The MATLAB dashboard currently calculates its own simulated data and is not directly connected to the physical ESP32 demonstration.

The physical prototype and connected leaderboard interface are separate demonstration components.

Future work may include inverter telemetry, environmental sensor integration, real PV measurements, experimentally calibrated soiling estimation, actuator energy modeling, and validated pavilion scoring.

--------------------------------------------------
11. PROJECT CONCLUSION
--------------------------------------------------

The DHIYA simulation demonstrates how solar generation, soiling accumulation, condition-based cleaning, and idealized solar tracking can be represented and compared using MATLAB and Simulink.

Under the selected assumptions, the complete DHIYA scenario generated approximately 689 Wh compared with 546 Wh for conventional operation, representing a simulated improvement of approximately 26.3% before tracking actuator energy consumption.

The project provides a foundation for further development of intelligent solar maintenance, monitoring, and public-facing sustainability visualization.

==================================================
DHIYA (ضياء)
Smart Solar Intelligence
Expo 2030 Riyadh Sustainability Challenge
==================================================