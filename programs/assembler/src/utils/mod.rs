pub mod bpf_writer;
pub mod metadata;

pub use bpf_writer::BpfWriter;
pub use metadata::*;

pub const DESCRIMINATOR_SIZE: usize = 8;
pub const EXTRA_SIZE: usize = DESCRIMINATOR_SIZE + 200;
