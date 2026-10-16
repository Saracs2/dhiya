%% DHIYA Phase 3 - Solar tracking and Expo pavilion challenge
% Requires MATLAB and standard Simulink only.
% Model is a control-oriented demonstration, not a validated PV plant model.
clearvars; clc;
model = 'DHIYA_Phase3';
if bdIsLoaded(model), close_system(model,0); end
if isfile([model '.slx'])
    error('DHIYA_Phase3.slx already exists. Rename it before rebuilding.');
end
new_system(model);
open_system(model);
dt=1/60; t=(0:dt:24)';
% Daily irradiance, normalized sun position, illustrative dust exposure
G=1000*max(0,sin(pi*(t-6)/12)); G(t<6 | t>18)=0;
% Fixed orientation loss at morning/evening, tracking idealization
orientationFixed=0.72+0.28*max(0,sin(pi*(t-6)/12));
orientationFixed(G==0)=0.72;
% tracking multiplier applies to irradiance-limited reference power
% so tracking gain is bounded, and both share the same environmental profile
rate=0.02; threshold=0.20; removal=0.95;
% Simulate dust and cleaning as a discrete state machine. Cleaning only
% when daylight irradiance >200 W/m2; one cleaning action per crossing.
dustBase=zeros(size(t)); dustSmart=zeros(size(t)); clean=zeros(size(t));
for k=2:numel(t)
    dustBase(k)=min(0.8,dustBase(k-1)+rate*dt);
    nextDust=min(0.8,dustSmart(k-1)+rate*dt);
    if nextDust>=threshold && G(k)>200
        clean(k)=1;
        nextDust=nextDust*(1-removal);
    end
    dustSmart(k)=nextDust;
end
% Distinct pavilion capacity and normalized operating-performance factors
capacities=[100 150 80];
perfFactors=[1.00 0.96 0.91];
% 100 W rated demo panel, three fictional pavilion profiles
fixedPower=capacities(1)*(G/1000).*orientationFixed.*(1-dustBase);
smartPower=capacities(1)*(G/1000).*(1-dustSmart);
% 0.5 Wh per cleaning event; tracking motor energy omitted, clearly stated
cleanEvents=sum(clean);
cleaningWh=0.5*cleanEvents;
Efixed=trapz(t,fixedPower); Esmart=trapz(t,smartPower);
% Pavilion rankings use delivered energy / idealized reference energy,
% not raw kWh, and represent simulation-only performance.
pavilionPower=[smartPower*perfFactors(1),smartPower*perfFactors(2),smartPower*perfFactors(3)];
pavilionEnergy=trapz(t,pavilionPower,1);
referenceEnergy=trapz(t,capacities(1)*(G/1000));
normalizedScores=100*pavilionEnergy./(capacities*referenceEnergy/capacities(1));
% Inputs are defined as timeseries; From Workspace uses interpolation.
assignin('base','dhiya_G',timeseries(G,t));
assignin('base','dhiya_fixedOrientation',timeseries(orientationFixed,t));
assignin('base','dhiya_dustBase',timeseries(dustBase,t));
assignin('base','dhiya_dustSmart',timeseries(dustSmart,t));
assignin('base','dhiya_cleaning',timeseries(clean,t));
assignin('base','dhiya_pavilionScores',timeseries(repmat(normalizedScores,numel(t),1),t));
% Configure model: one simulation time unit is one hour
set_param(model,'StopTime','24','SolverType','Fixed-step', ...
    'Solver','FixedStepDiscrete','FixedStep',num2str(dt,17));
% Helper functions at end of script build clean, connected sections.
source(model,'Irradiance', 'dhiya_G',[60 120 200 160]);
source(model,'Fixed Orientation','dhiya_fixedOrientation',[60 225 200 265]);
source(model,'Dust - No Cleaning','dhiya_dustBase',[60 335 200 375]);
source(model,'Dust - DHIYA','dhiya_dustSmart',[60 440 200 480]);
source(model,'Cleaning Events','dhiya_cleaning',[60 545 200 585]);
source(model,'Pavilion Scores','dhiya_pavilionScores',[60 670 200 710]);
% Calculate clean power from irradiance
add_block('simulink/Math Operations/Gain',[model '/Rated Power Scaling'], ...
    'Gain','0.1','Position',[290 115 390 165]);
% Orientation and dust efficiencies are separate, readable subsystems
add_block('simulink/Math Operations/Bias',[model '/Base Efficiency'], ...
    'Bias','1','Position',[310 335 410 375]);
add_block('simulink/Math Operations/Gain',[model '/Negate Base Dust'], ...
    'Gain','-1','Position',[225 335 285 375]);
add_block('simulink/Math Operations/Bias',[model '/Smart Efficiency'], ...
    'Bias','1','Position',[310 440 410 480]);
add_block('simulink/Math Operations/Gain',[model '/Negate Smart Dust'], ...
    'Gain','-1','Position',[225 440 285 480]);
add_block('simulink/Math Operations/Product',[model '/Fixed Orientation and Dust'], ...
    'Inputs','2','Position',[505 240 555 305]);
add_block('simulink/Math Operations/Product',[model '/Fixed Panel Power'], ...
    'Inputs','2','Position',[645 145 695 210]);
add_block('simulink/Math Operations/Product',[model '/DHIYA Tracking Power'], ...
    'Inputs','2','Position',[645 385 695 450]);
add_block('simulink/Signal Routing/Mux',[model '/Power Comparison Mux'], ...
    'Inputs','2','Position',[795 220 800 325]);
add_block('simulink/Sinks/Scope',[model '/Power Comparison Scope'], ...
    'Position',[900 245 960 300]);
add_block('simulink/Signal Routing/Mux',[model '/Dust Comparison Mux'], ...
    'Inputs','2','Position',[795 465 800 535]);
add_block('simulink/Sinks/Scope',[model '/Dust Comparison Scope'], ...
    'Position',[900 475 960 525]);
add_block('simulink/Sinks/Scope',[model '/Cleaning Events Scope'], ...
    'Position',[900 570 960 620]);
add_block('simulink/Sinks/Display',[model '/Pavilion Scores Display'], ...
    'Position',[850 665 1010 740]);
add_block('simulink/Sinks/To Workspace',[model '/Log Fixed Power'], ...
    'VariableName','fixedPowerSim','SaveFormat','Timeseries', ...
    'Position',[900 140 1040 180]);
add_block('simulink/Sinks/To Workspace',[model '/Log DHIYA Power'], ...
    'VariableName','smartPowerSim','SaveFormat','Timeseries', ...
    'Position',[900 375 1040 415]);
connect(model,'Irradiance/1','Rated Power Scaling/1');
connect(model,'Dust - No Cleaning/1','Negate Base Dust/1');
connect(model,'Negate Base Dust/1','Base Efficiency/1');
connect(model,'Dust - DHIYA/1','Negate Smart Dust/1');
connect(model,'Negate Smart Dust/1','Smart Efficiency/1');
connect(model,'Fixed Orientation/1','Fixed Orientation and Dust/1');
connect(model,'Base Efficiency/1','Fixed Orientation and Dust/2');
connect(model,'Rated Power Scaling/1','Fixed Panel Power/1');
connect(model,'Fixed Orientation and Dust/1','Fixed Panel Power/2');
connect(model,'Rated Power Scaling/1','DHIYA Tracking Power/1');
connect(model,'Smart Efficiency/1','DHIYA Tracking Power/2');
connect(model,'Fixed Panel Power/1','Power Comparison Mux/1');
connect(model,'DHIYA Tracking Power/1','Power Comparison Mux/2');
connect(model,'Power Comparison Mux/1','Power Comparison Scope/1');
connect(model,'Dust - No Cleaning/1','Dust Comparison Mux/1');
connect(model,'Dust - DHIYA/1','Dust Comparison Mux/2');
connect(model,'Dust Comparison Mux/1','Dust Comparison Scope/1');
connect(model,'Cleaning Events/1','Cleaning Events Scope/1');
connect(model,'Pavilion Scores/1','Pavilion Scores Display/1');
connect(model,'Fixed Panel Power/1','Log Fixed Power/1');
connect(model,'DHIYA Tracking Power/1','Log DHIYA Power/1');
Simulink.Annotation(model,'DHIYA | Smart Solar Energy System - Phase 3');
save_system(model);
results=sim(model);
% Reporting uses the same mathematical inputs as the Simulink blocks.
energyImprovement=Esmart-cleaningWh-Efixed;
fprintf('\n--- DHIYA PHASE 3: ILLUSTRATIVE RESULTS ---\n');
fprintf('Fixed dusty panel: %.2f Wh\n',Efixed);
fprintf('DHIYA gross output: %.2f Wh\n',Esmart);
fprintf('Cleaning cycles: %d\n',cleanEvents);
fprintf('Cleaning energy: %.2f Wh\n',cleaningWh);
fprintf('DHIYA net energy (cleaning only): %.2f Wh\n',Esmart-cleaningWh);
fprintf('Net improvement before tracking motor use: %.2f Wh\n',energyImprovement);
fprintf('NOTE: Tracking actuator energy is NOT included.\n');
labels={'Saudi Arabia','Japan','Germany'};
[rankScores,idx]=sort(normalizedScores,'descend');
fprintf('\nEXPO PAVILION SCORES (fictional simulated data)\n');
for i=1:3
 fprintf('%d. %s: %.1f%%\n',i,labels{idx(i)},rankScores(i));
end
figure('Name','DHIYA Phase 3 - Energy Performance');
plot(t,fixedPower,'LineWidth',1.8); hold on;
plot(t,smartPower,'LineWidth',1.8);
xlabel('Time (hours)'); ylabel('Power (W)');
title('DHIYA vs Fixed, Uncleaned Panel');
legend('Fixed + no cleaning','DHIYA + tracking + cleaning','Location','best');
grid on;
figure('Name','DHIYA - Expo Pavilion Leaderboard');
bar(normalizedScores); ylim([0 110]);
set(gca,'XTick',1:3,'XTickLabel',labels);
ylabel('Normalized energy score (%)');
title('Illustrative Expo Pavilion Competition'); grid on;

function source(model,name,variable,position)
add_block('simulink/Sources/From Workspace',[model '/' name], ...
 'VariableName',variable,'Interpolate','on','Position',position);
end
function connect(model,from,to)
add_line(model,from,to,'autorouting','on');
end
