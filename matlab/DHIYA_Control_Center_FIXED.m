function DHIYA_Control_Center_FIXED()
% DHIYA Control Center - self-contained MATLAB dashboard
% MATLAB R2026a compatible uifigure / uigridlayout application.
% Pavilion inputs are illustrative and NOT live Expo data.
% This dashboard recalculates its own profiles; it does not control Simulink.
clc; clear all;
%% Data: 24 simulated hours, 1-minute intervals
step = 1/60;
t = (0:step:24)';
G = 1000*max(0,sin(pi*(t-6)/12));
G(t<6 | t>18)=0;
fixedOrientation = 0.72 + 0.28*max(0,sin(pi*(t-6)/12));
baseDust = min(0.8,0.02*t);
smartDust = zeros(size(t));
cleaningEvents = zeros(size(t));
for k = 2:numel(t)
    dust = min(0.8,smartDust(k-1)+0.02*step);
    if dust >= 0.20 && G(k) > 200
        cleaningEvents(k) = 1;
        dust = dust*(1-0.95);
    end
    smartDust(k) = dust;
end
Pbase = 100*(G/1000).*fixedOrientation.*(1-baseDust);
Psmart = 100*(G/1000).*(1-smartDust);
energySmart = cumtrapz(t,Psmart); % hours x watts = Wh
energyBase = cumtrapz(t,Pbase);

% Pavilion competition uses DEMONSTRATION inputs, not model measurements.
names = {'Saudi Arabia','Japan','Germany'};
perf = [0.94, 0.88, 0.91];
contribution = [0.78, 0.90, 0.62];
maintenance = [0.95, 0.74, 0.85];
weights = [0.50, 0.30, 0.20];
scores = boundedScores(perf, contribution, maintenance, weights);

%% Theme
bg = [0.065 0.085 0.11];
card = [0.11 0.15 0.19];
white = [0.93 0.96 0.97];
muted = [0.70 0.76 0.80];
teal = [0.20 0.86 0.72];
gold = [1.00 0.77 0.38];
blue = [0.32 0.62 1.00];

%% Window and main responsive grid
fig = uifigure('Name','DHIYA | Expo Solar Control Center', ...
    'Position',[80 70 1220 790],'Color',bg);
root = uigridlayout(fig,[4 2]);
root.RowHeight = {85,115,'1x',190};
root.ColumnWidth = {'1.25x','1x'};
root.Padding = [18 15 18 15];
root.RowSpacing = 12;
root.ColumnSpacing = 12;
root.BackgroundColor = bg;

%% Header (no unsupported label properties)
header = uipanel(root,'BorderType','none','BackgroundColor',bg);
header.Layout.Row=1;
header.Layout.Column=[1 2];
hgrid = uigridlayout(header,[2 1]);
hgrid.RowHeight = {46,23};
hgrid.Padding = [3 0 3 0];
hgrid.RowSpacing = 0;
hgrid.BackgroundColor = bg;
uilabel(hgrid,'Text','DHIYA  |  Smart Solar Intelligence', ...
    'FontSize',27,'FontWeight','bold','FontColor',teal);
uilabel(hgrid,'Text','EXPO PAVILION CHALLENGE   |   SIMULATED DEMONSTRATION', ...
    'FontSize',12,'FontColor',muted);

%% Metrics
metrics = uipanel(root,'Title','Solar system status','BackgroundColor',card);
metrics.Layout.Row=2;
metrics.Layout.Column=[1 2];
mg = uigridlayout(metrics,[1 4]);
mg.ColumnWidth = {'1x','1x','1x','1x'};
mg.Padding = [15 10 15 8];
mg.ColumnSpacing=12;
mg.BackgroundColor=card;
powerText = uilabel(mg,'Text','POWER  -- W','FontSize',18, ...
    'FontWeight','bold','FontColor',teal);
dustText = uilabel(mg,'Text','SOILING  -- %','FontSize',18, ...
    'FontWeight','bold','FontColor',gold);
energyText = uilabel(mg,'Text','ENERGY  -- Wh','FontSize',18, ...
    'FontWeight','bold','FontColor',blue);
cleanText = uilabel(mg,'Text','CLEANING  --','FontSize',17, ...
    'FontWeight','bold','FontColor',white);

%% Power plot (axes automatically fit their panel)
powerPanel = uipanel(root,'Title','Solar power throughout the day', ...
    'BackgroundColor',card);
powerPanel.Layout.Row=3;
powerPanel.Layout.Column=1;
pgrid = uigridlayout(powerPanel,[1 1]);
pgrid.Padding = [10 8 10 8];
pgrid.BackgroundColor = card;
ax = uiaxes(pgrid);
ax.Color = card;
ax.XColor = white;
ax.YColor = white;
ax.GridColor = muted;
plot(ax,t,Pbase,'LineWidth',1.7,'Color',blue);
hold(ax,'on');
plot(ax,t,Psmart,'LineWidth',2.3,'Color',teal);
cursor = xline(ax,12,'--','Color',gold,'LineWidth',1.5);
xlim(ax,[0 24]);
ylim(ax,[0 110]);
grid(ax,'on');
xlabel(ax,'Hour','Color',white);
ylabel(ax,'Power (W)','Color',white);
legend(ax,{'Fixed / uncleaned','DHIYA smart'},'Location','northwest', ...
    'TextColor',white,'Color',card);

%% Leaderboard
leaderPanel = uipanel(root,'Title','Expo pavilion leaderboard (0 to 100)', ...
    'BackgroundColor',card);
leaderPanel.Layout.Row=3;
leaderPanel.Layout.Column=2;
lgrid = uigridlayout(leaderPanel,[1 1]);
lgrid.Padding=[10 8 10 8];
lgrid.BackgroundColor=card;
barAx=uiaxes(lgrid);
barAx.Color=card;
barAx.XColor=white;
barAx.YColor=white;
barAx.GridColor=muted;
b = bar(barAx,scores,'FaceColor',teal);
ylim(barAx,[0 100]);
barAx.XTick=1:3;
barAx.XTickLabel=names;
ylabel(barAx,'Sustainability score / 100','Color',white);
grid(barAx,'on');

%% Interactive controls
controlPanel = uipanel(root,'Title','Interactive demonstration', ...
    'BackgroundColor',card);
controlPanel.Layout.Row=4;
controlPanel.Layout.Column=1;
cgrid=uigridlayout(controlPanel,[4 2]);
cgrid.RowHeight={24,38,24,38};
cgrid.ColumnWidth={140,'1x'};
cgrid.Padding=[15 8 20 8];
cgrid.RowSpacing=1;
cgrid.BackgroundColor=card;

lbl=uilabel(cgrid,'Text','Time of day','FontColor',white);
lbl.Layout.Row=1; lbl.Layout.Column=1;
timeValueText=uilabel(cgrid,'Text','12:00','FontColor',teal,'FontWeight','bold');
timeValueText.Layout.Row=1; timeValueText.Layout.Column=2;
timeSlider=uislider(cgrid,'Limits',[0 24],'Value',12,'MajorTicks',0:3:24);
timeSlider.Layout.Row=2;timeSlider.Layout.Column=[1 2];

lbl=uilabel(cgrid,'Text','Extra dust scenario','FontColor',white);
lbl.Layout.Row=3;lbl.Layout.Column=1;
dustValueText=uilabel(cgrid,'Text','0%','FontColor',gold,'FontWeight','bold');
dustValueText.Layout.Row=3;dustValueText.Layout.Column=2;
dustSlider=uislider(cgrid,'Limits',[0 30],'Value',0,'MajorTicks',0:5:30);
dustSlider.Layout.Row=4;dustSlider.Layout.Column=[1 2];

%% Scoring explanation
scorePanel=uipanel(root,'Title','Transparent competition scoring', ...
    'BackgroundColor',card);
scorePanel.Layout.Row=4;
scorePanel.Layout.Column=2;
sg = uigridlayout(scorePanel,[4 1]);
sg.RowHeight={'1x','1x','1x','1x'};
sg.Padding=[12 8 12 8];
sg.RowSpacing=3;
sg.BackgroundColor=card;
uilabel(sg,'Text','50% Solar performance + 30% contribution + 20% maintenance', ...
    'FontColor',teal,'FontWeight','bold','FontSize',11);
uilabel(sg,'Text','Performance: actual / weather-adjusted expected energy', ...
    'FontColor',white,'FontSize',11);
uilabel(sg,'Text','Contribution: on-site solar used / electricity demand', ...
    'FontColor',white,'FontSize',11);
uilabel(sg,'Text','Maintenance: illustrative index; requires field validation', ...
    'FontColor',muted,'FontSize',11);

% Callback functions are nested: they can access local data and controls.
timeSlider.ValueChangedFcn = @(src,evt) refresh(src.Value,dustSlider.Value);
timeSlider.ValueChangingFcn = @(src,evt) refresh(evt.Value,dustSlider.Value);
dustSlider.ValueChangedFcn = @(src,evt) refresh(timeSlider.Value,src.Value);
dustSlider.ValueChangingFcn = @(src,evt) refresh(timeSlider.Value,evt.Value);
refresh(12,0);

    function refresh(hour,extraDust)
        idx=max(1,min(numel(t),round(hour/step)+1));
        effectiveDust=min(1,smartDust(idx)+extraDust/100);
        % Extra dust changes output only for this what-if scenario.
        actualPower=Psmart(idx)*max(0,1-extraDust/100);
        powerText.Text=sprintf('POWER  %.1f W',actualPower);
        dustText.Text=sprintf('SOILING  %.1f %%',100*effectiveDust);
        energyText.Text=sprintf('ENERGY  %.1f Wh',energySmart(idx));
        if cleaningEvents(idx)>0
            cleanText.Text='CLEANING  ACTIVE';
        else
            cleanText.Text='CLEANING  STANDBY';
        end
        timeValueText.Text=sprintf('%02d:%02d',floor(hour),round(60*mod(hour,1)));
        dustValueText.Text=sprintf('%.1f%% extra dust',extraDust);
        cursor.Value=hour;
        adjustedPerf=perf;
        adjustedPerf(1)=perf(1)*max(0,1-extraDust/100);
        newScore=boundedScores(adjustedPerf,contribution,maintenance,weights);
        b.YData=newScore;
        [best,ix]=max(newScore);
        title(barAx,sprintf('Leader: %s (%.1f / 100)',names{ix},best), ...
            'Color',white,'FontSize',12);
    end
end

function score=boundedScores(perf,contribution,maintenance,weights)
perf=max(0,min(1,perf));
contribution=max(0,min(1,contribution));
maintenance=max(0,min(1,maintenance));
score=100*(weights(1)*perf+weights(2)*contribution+weights(3)*maintenance);
score=max(0,min(100,score));
end
