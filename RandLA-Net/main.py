import custom_config as cfg
from CustomRanlanet import Network 

cfg.saving = False
model = Network(dataset, cfg)

# Model path selection logic
if FLAGS.model_path is not 'None':
    chosen_snap = FLAGS.model_path
else:
    # Automatically find the latest snapshot
    chosen_snapshot = -1
    logs = np.sort([os.path.join('results', f) for f in os.listdir('results') if f.startswith('Log')])
    chosen_folder = logs[-1]
    
    # Find the latest snapshot in the most recent log folder
    snap_path = join(chosen_folder, 'snapshots')
    snap_steps = [int(f[:-5].split('-')[-1]) for f in os.listdir(snap_path) if f[-5:] == '.meta']
    chosen_step = np.sort(snap_steps)[-1]
    chosen_snap = os.path.join(snap_path, 'snap-{:d}'.format(chosen_step))

# Create a model tester and run the test
tester = ModelTester(model, dataset, restore_snap=chosen_snap)
tester.test(model, dataset)