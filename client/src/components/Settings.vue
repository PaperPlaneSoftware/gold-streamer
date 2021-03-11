<template>
  <div>
    <!-- OSC -->
    <div class="p-3">
      <b-button v-b-toggle.collapse-1 variant="outline-primary">OSC</b-button>
      <b-collapse id="collapse-1" class="mt-2">
        <b-card border-variant="secondary">
          <p class="card-text"><b>Port:</b> {{ oscPort }}</p>
          <p class="card-text"><b>Address:</b> {{ oscAddress }}</p>
          <template #footer>
            <small class="text-muted">{{ oscDescription }}</small>
          </template>
        </b-card>
      </b-collapse>
    </div>

    <!-- Freq -->
    <div class="p-3">
      <b-button v-b-toggle.collapse-2 variant="outline-primary">Updates frequency</b-button>
      <b-collapse id="collapse-2" class="mt-2">
        <b-card border-variant="secondary">
          <p class="card-text"><b>Broadcast:</b> {{ freqBroadcast }}</p>
          <p class="card-text"><b>Update:</b> {{ freqUpdate }} ms</p>
          <template #footer>
            <small class="text-muted">{{ freqDescription }}</small>
          </template>
        </b-card>
      </b-collapse>
    </div>

    <!-- External -->
    <div class="p-3">
      <b-button v-b-toggle.collapse-3 variant="outline-primary">External folder</b-button>
      <b-collapse id="collapse-3" class="mt-2">
        <b-card border-variant="secondary">
          <p class="card-text"><b>Dir:</b> {{ externalDir }}</p>
          <template #footer>
            <small class="text-muted">{{ externalDescription }}</small>
          </template>
        </b-card>
      </b-collapse>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api';

export default defineComponent({
  props: {
    settings: {
      type: Object,
      required: false,
    },
  },

  setup(props) {
    //OSC
    const oscPort = computed(() => {
      return props.settings ? props.settings.general.osc.port : '';
    });
    const oscAddress = computed(() => {
      return props.settings ? props.settings.general.osc.address : '';
    });
    const oscDescription = computed(() => {
      return props.settings ? props.settings.general.osc.description : '';
    });

    //Freq
    const freqBroadcast = computed(() => {
      return props.settings ? props.settings.general.freq.broadcast : '';
    });
    const freqUpdate = computed(() => {
      return props.settings ? props.settings.general.freq.update : '';
    });
    const freqDescription = computed(() => {
      return props.settings ? props.settings.general.freq.description : '';
    });

    //External
    const externalDir = computed(() => {
      return props.settings ? props.settings.general.external.dir : '';
    });
    const externalDescription = computed(() => {
      return props.settings ? props.settings.general.external.description : '';
    });

    return {
      oscPort,
      oscAddress,
      oscDescription,
      freqBroadcast,
      freqUpdate,
      freqDescription,
      externalDir,
      externalDescription,
    };
  },
});
</script>
