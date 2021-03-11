<template>
  <div class="p-3 my-4">
    <div v-if="streams.length > 0">
      <b-card
        v-for="(stream, i) in streams"
        class="mb-2 p-0"
        :key="`stream-${i}`"
        bg-variant="white"
        text-variant="dark"
        no-body
      >
        <b-card-header header-bg-variant="white">
          <div class="d-flex align-items-center">
            <b class="mr-2">#{{ stream.id }}</b>
            <span class="stream-name">{{ stream.address }}</span>
            <!-- <b-button variant="link" @click="() => activateSource(stream)">
              <b-icon :icon="stream.active ? 'pause' : 'play'" />
            </b-button> -->
          </div>
        </b-card-header>
      </b-card>
    </div>

    <b-card v-else bg-variant="secondary">
      No sources detected ...
    </b-card>

    <hr class="border-primary w-50 my-5" />

    <h5>Upload</h5>
    <b-form-file v-model="file" size="sm" class="mb-2" />
    <b-button :disabled="!file" variant="outline-primary" @click="upload">Upload</b-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from '@vue/composition-api';
import axios from 'axios';

const BASE_URL = process.env.VUE_APP_BASE_URL;

export default defineComponent({
  props: {
    streams: {
      type: Array,
      required: true,
    },
  },

  setup() {
    function activateSource(stream) {
      stream.active = !stream.active;
      axios
        .get(`${BASE_URL}/activate-source/${stream.id}/${stream.active}`)
        .catch(err => console.log(err));
    }

    const streamsRes = {
      activateSource,
    };

    // Files
    ///////////////////////////////////////////////////////////////////////////
    const file: Ref<File | null> = ref(null);

    function upload() {
      if (file.value !== undefined) {
        const formData = new FormData();
        formData.append('bvh', file.value);

        axios
          .post(`${BASE_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          .then(res => console.log(res));
      }
    }

    const filesRes = {
      file,
      upload,
    };

    return {
      ...streamsRes,
      ...filesRes,
    };
  },
});
</script>

<style lang="scss">
@import '../assets/scss/custom.scss';

.custom-file-label {
  cursor: pointer !important;
}
</style>

<style lang="scss" scoped>
@import '../assets/scss/custom.scss';

.stream-name {
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
}
</style>
