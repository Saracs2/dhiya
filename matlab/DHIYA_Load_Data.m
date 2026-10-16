
%% DHIYA PHASE 3 - LOAD SIMULATION DATA
% Restores missing From Workspace variables.
% Does NOT rebuild or delete the Simulink model.

clc;

%% 1. Simulation time (24 hours, 1-minute steps)
dt = 1/60;
t = (0:dt:24)';

%% 2. Simulated solar irradiance
G = 1000 * max(0, sin(pi*(t-6)/12));
G(t < 6 | t > 18) = 0;

%% 3. Fixed panel orientation factor
orientationFixed = 0.72 + ...
    0.28 * max(0, sin(pi*(t-6)/12));

orientationFixed(G == 0) = 0.72;

%% 4. Dust and cleaning parameters
rate = 0.02;        % 2 percentage points per hour
threshold = 0.20;  % Cleaning at 20% soiling
removal = 0.95;    % Removes 95% of accumulated soiling

dustBase = zeros(size(t));
dustSmart = zeros(size(t));
clean = zeros(size(t));

%% 5. Simulate dust buildup and automatic cleaning
for k = 2:numel(t)

    % Conventional panel: no cleaning
    dustBase(k) = min(0.8, ...
        dustBase(k-1) + rate*dt);

    % DHIYA panel: smart cleaning
    nextDust = min(0.8, ...
        dustSmart(k-1) + rate*dt);

    if nextDust >= threshold && G(k) > 200
        clean(k) = 1;
        nextDust = nextDust * (1-removal);
    end

    dustSmart(k) = nextDust;
end

%% 6. Calculate solar power
ratedPower = 100;

fixedPower = ratedPower * (G/1000) ...
    .* orientationFixed .* (1-dustBase);

smartPower = ratedPower * (G/1000) ...
    .* (1-dustSmart);

%% 7. Calculate generated energy
Efixed = trapz(t, fixedPower);
Esmart = trapz(t, smartPower);

cleanEvents = sum(clean);
cleaningWh = cleanEvents * 0.5;

%% 8. Illustrative pavilion scores
capacities = [100 150 80];
perfFactors = [1.00 0.96 0.91];

pavilionPower = [
    smartPower * perfFactors(1), ...
    smartPower * perfFactors(2), ...
    smartPower * perfFactors(3)
];

pavilionEnergy = trapz(t, pavilionPower, 1);

referenceEnergy = trapz(t, ratedPower*(G/1000));

normalizedScores = 100 * pavilionEnergy ./ ...
    (capacities * referenceEnergy / capacities(1));

%% 9. Restore every Simulink input variable
assignin('base', 'dhiya_G', ...
    timeseries(G,t));

assignin('base', 'dhiya_fixedOrientation', ...
    timeseries(orientationFixed,t));

assignin('base', 'dhiya_dustBase', ...
    timeseries(dustBase,t));

assignin('base', 'dhiya_dustSmart', ...
    timeseries(dustSmart,t));

assignin('base', 'dhiya_cleaning', ...
    timeseries(clean,t));

assignin('base', 'dhiya_pavilionScores', ...
    timeseries( ...
        repmat(normalizedScores,numel(t),1),t));

%% 10. Display confirmation
disp('==================================');
disp(' DHIYA INPUT DATA RESTORED');
disp('==================================');

fprintf('Fixed energy: %.2f Wh\n', Efixed);
fprintf('DHIYA energy: %.2f Wh\n', Esmart);
fprintf('Cleaning events: %d\n', cleanEvents);
fprintf('Cleaning energy: %.2f Wh\n', cleaningWh);

disp('All six Simulink inputs are ready.');


