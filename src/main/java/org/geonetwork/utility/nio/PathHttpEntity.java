/*
 * (c) 2003 Open Source Geospatial Foundation - all rights reserved
 * This code is licensed under the GPL 2.0 license,
 * available at the root application directory.
 */
package org.geonetwork.utility.nio;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import javax.annotation.concurrent.NotThreadSafe;
import org.apache.http.entity.AbstractHttpEntity;
import org.apache.http.entity.ContentType;
import org.apache.http.util.Args;
import org.geonetwork.utility.io.IO;

/**
 * A self contained, repeatable entity that obtains its content from a file.
 *
 * @since 4.0
 */
@NotThreadSafe
public class PathHttpEntity extends AbstractHttpEntity implements Cloneable {

  protected final Path file;

  public PathHttpEntity(final Path file, final ContentType contentType) {
    super();
    this.file = Args.notNull(file, "File");
    if (contentType != null) {
      setContentType(contentType.toString());
    }
  }

  public PathHttpEntity(final Path file) {
    this(file, null);
  }

  public boolean isRepeatable() {
    return true;
  }

  public long getContentLength() {
    try {
      return Files.size(this.file);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  public InputStream getContent() throws IOException {
    return IO.newInputStream(this.file);
  }

  public void writeTo(final OutputStream outstream) throws IOException {
    Args.notNull(outstream, "Output stream");

    try (final InputStream instream = IO.newInputStream(this.file)) {
      final byte[] tmp = new byte[OUTPUT_BUFFER_SIZE];
      int l;
      while ((l = instream.read(tmp)) != -1) {
        outstream.write(tmp, 0, l);
      }
      outstream.flush();
    }
  }

  /**
   * Tells that this entity is not streaming.
   *
   * @return <code>false</code>
   */
  public boolean isStreaming() {
    return false;
  }

  @Override
  public Object clone() throws CloneNotSupportedException {
    // File instance is considered immutable
    // No need to make a copy of it
    return super.clone();
  }
} // class FileEntity
